import type { PlaygroundApi, PlaygroundFiles } from "@sv/playground";
import elementsDocs from "../../../assets/llms.txt?raw";
import systemPrompt from "./system-prompt.txt?raw";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { twMerge } from "tailwind-merge";
import {
  deleteSession,
  formatSessionDate,
  generateSessionId,
  listSessions,
  loadSession,
  saveSession,
  type ChatMessage,
  type Session,
} from "./session-storage.js";

type Provider = "ollama" | "openrouter";

type AiConfig = {
  ollamaEndpoint: string;
  ollamaModel: string;
  openrouterApiKey: string;
  openrouterModel: string;
  provider: Provider;
};

type ProviderMessage = {
  content?: string | null;
  role: "assistant" | "system" | "tool" | "user";
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

type StreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
      role?: ProviderMessage["role"];
      tool_calls?: Array<{
        function?: {
          arguments?: string;
          name?: string;
        };
        id?: string;
        index?: number;
        type?: "function";
      }>;
    };
    finish_reason?: string | null;
  }>;
  error?: {
    message?: string;
  };
};

type ToolCall = {
  function: {
    arguments: string;
    name: string;
  };
  id: string;
  type: "function";
};

type AIChatPanelProps = {
  className?: string;
  currentFiles: PlaygroundFiles;
  defaultFiles: PlaygroundFiles;
  playgroundRef: RefObject<PlaygroundApi | null>;
  setCurrentFiles: (files: PlaygroundFiles) => void;
};

const DEFAULT_AI_CONFIG: AiConfig = {
  provider: "openrouter",
  openrouterApiKey: "",
  openrouterModel: "openai/gpt-5.4",
  ollamaEndpoint: "http://localhost:11434/v1/chat/completions",
  ollamaModel: "qwen3.5:4b",
};

const TOOL_DEFINITIONS = [
  {
    function: {
      description:
        "Read the current playground files before making edits or when the user asks what is currently in the playground.",
      name: "get_playground_state",
      parameters: {
        additionalProperties: false,
        properties: {},
        type: "object",
      },
    },
    type: "function",
  },
  {
    function: {
      description:
        "Set a short session title that summarizes the user's request. Use this as the first tool call in a new chat before other tools.",
      name: "set_session_title",
      parameters: {
        additionalProperties: false,
        properties: {
          title: {
            description: "A concise session title, ideally 2 to 6 words.",
            type: "string",
          },
        },
        required: ["title"],
        type: "object",
      },
    },
    type: "function",
  },
  {
    function: {
      description:
        "Look up documentation details for an Atrium custom element or related primitive from the local docs knowledge base.",
      name: "search_custom_element_docs",
      parameters: {
        additionalProperties: false,
        properties: {
          query: {
            description: "Element tag, package name, or capability to search for, like a-popover, tabs, form, or calendar.",
            type: "string",
          },
        },
        required: ["query"],
        type: "object",
      },
    },
    type: "function",
  },
  {
    function: {
      description:
        "Update one or both playground files. Use this when you want to change HTML, TSX, or both, then rerender the preview.",
      name: "update_playground_files",
      parameters: {
        additionalProperties: false,
        properties: {
          html: {
            description: "Full replacement content for index.html when needed.",
            type: "string",
          },
          rerender: {
            description: "Whether to rerender the preview after updating files.",
            type: "boolean",
          },
          summary: {
            description: "Short note describing what was changed.",
            type: "string",
          },
          tsx: {
            description: "Full replacement content for index.tsx when needed.",
            type: "string",
          },
        },
        type: "object",
      },
    },
    type: "function",
  },
] as const;

function getProviderLabel(config: AiConfig) {
  return config.provider === "openrouter"
    ? config.openrouterModel || "OpenRouter"
    : config.ollamaModel || "Ollama";
}

function getEndpoint(config: AiConfig) {
  return config.provider === "openrouter"
    ? "https://openrouter.ai/api/v1/chat/completions"
    : config.ollamaEndpoint;
}

function getModel(config: AiConfig) {
  return config.provider === "openrouter" ? config.openrouterModel : config.ollamaModel;
}

function getHeaders(config: AiConfig) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.provider === "openrouter") {
    if (!config.openrouterApiKey.trim()) {
      throw new Error("OpenRouter requires an API key.");
    }

    headers.Authorization = `Bearer ${config.openrouterApiKey.trim()}`;
    headers["HTTP-Referer"] = window.location.origin;
    headers["X-Title"] = "Atrium Playground";
  }

  return headers;
}

function normalizeAssistantContent(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
          return part.text;
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

function parseToolArguments(value: string) {
  if (!value.trim()) {
    return {};
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    throw new Error(`Invalid tool arguments: ${value}`);
  }
}

function buildInitialConversation(history: ChatMessage[]): ProviderMessage[] {
  return history.map((message) => ({
    content: message.content,
    role: message.role,
  }));
}

const ELEMENTS_LIBRARY_SUMMARY = `Available Atrium custom elements from @sv/elements:
- Layout and disclosure: a-box, a-expandable, a-list, a-list-item, a-tabs, a-tabs-list, a-tabs-tab, a-tabs-panel
- Overlay and portal: a-popover, a-popover-trigger, a-popover-arrow, a-popover-portal, a-tooltip, a-portal, a-blur
- Inputs and forms: a-toggle, a-range, a-select, a-option, a-form-field, a-form-field-error
- Feedback and utilities: a-loader, a-toast, a-toast-feed, a-time, a-scroll, a-track, a-transition
- Date and navigation: a-calendar, a-pager

Usage notes:
- Atrium custom elements are already available in this docs playground. Do not add import statements for them.
- Prefer these custom elements when they fit the task instead of rebuilding the same primitive from scratch.`;

function buildSystemPrompt(shouldSetTitle: boolean) {
  return `${systemPrompt}\n\n${ELEMENTS_LIBRARY_SUMMARY}\n\nSession title instruction: ${
    shouldSetTitle
      ? "This session is empty. Call set_session_title before any other tool or assistant text."
      : "This session already has messages. Do not call set_session_title unless the user explicitly asks to rename the session."
  }`;
}

function updateAssistantMessage(
  setChatHistory: Dispatch<SetStateAction<ChatMessage[]>>,
  content: string,
) {
  setChatHistory((prev) => {
    if (prev.length === 0) {
      return prev;
    }

    const next = [...prev];
    const last = next.at(-1);
    if (!last || last.role !== "assistant") {
      return prev;
    }

    next[next.length - 1] = {
      ...last,
      content,
    };
    return next;
  });
}

function formatToolStatus(toolCall: ToolCall) {
  if (toolCall.function.name === "get_playground_state") {
    return "Inspecting the current playground files...";
  }

  if (toolCall.function.name === "set_session_title") {
    return "Naming this session...";
  }

  if (toolCall.function.name === "search_custom_element_docs") {
    return "Looking up custom element details...";
  }

  if (toolCall.function.name === "update_playground_files") {
    return "Updating the playground files and preview...";
  }

  return `Running ${toolCall.function.name}...`;
}

export function AIChatPanel({
  className,
  currentFiles,
  defaultFiles,
  playgroundRef,
  setCurrentFiles,
}: AIChatPanelProps) {
  const saveTimeoutRef = useRef<number | null>(null);
  const currentFilesRef = useRef<PlaygroundFiles>(currentFiles);
  const providerPopoverRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [showProviderPopover, setShowProviderPopover] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState(() => generateSessionId());
  const [currentSessionName, setCurrentSessionName] = useState("Untitled Session");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ProviderMessage[]>([]);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiConfig, setAiConfig] = useState<AiConfig>(() => {
    const saved = localStorage.getItem("docs_playground_ai_config");
    if (!saved) {
      return DEFAULT_AI_CONFIG;
    }

    try {
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_AI_CONFIG;
    }
  });

  const providerLabel = useMemo(() => getProviderLabel(aiConfig), [aiConfig]);

  function searchCustomElementDocs(query: string) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      throw new Error("search_custom_element_docs requires a query.");
    }

    const sections = elementsDocs.split(/\n(?=### )/g);
    const matches = sections.filter((section) => {
      const normalizedSection = section.toLowerCase();
      return normalizedSection.includes(normalizedQuery);
    });

    if (matches.length === 0) {
      return `No exact match found for "${query}" in the Atrium elements docs. Available tags include a-box, a-expandable, a-list, a-popover, a-portal, a-blur, a-toggle, a-range, a-select, a-form-field, a-loader, a-time, a-scroll, a-track, a-transition, a-calendar, a-tabs, and a-pager.`;
    }

    return matches.slice(0, 3).join("\n\n---\n\n");
  }

  async function loadSessionsList() {
    setSessions(await listSessions());
  }

  async function saveCurrentSession() {
    await saveSession({
      chatHistory,
      files: currentFilesRef.current,
      id: currentSessionId,
      name: currentSessionName,
      timestamp: Date.now(),
    });
    await loadSessionsList();
  }

  async function createNewSession() {
    setCurrentSessionId(generateSessionId());
    setCurrentSessionName("Untitled Session");
    setChatHistory([]);
    setConversationHistory([]);
    setCurrentFiles(defaultFiles);
    currentFilesRef.current = defaultFiles;
    playgroundRef.current?.setFiles(defaultFiles);
    await playgroundRef.current?.pushCode();
  }

  async function loadSessionById(id: string) {
    const session = await loadSession(id);
    if (!session) {
      return;
    }

    setCurrentSessionId(session.id);
    setCurrentSessionName(session.name);
    setChatHistory(session.chatHistory);
    setConversationHistory(buildInitialConversation(session.chatHistory));
    setCurrentFiles(session.files);
    currentFilesRef.current = session.files;
    playgroundRef.current?.setFiles(session.files);
    await playgroundRef.current?.pushCode();
  }

  async function handleDeleteSession(id: string) {
    await deleteSession(id);
    await loadSessionsList();
    if (id === currentSessionId) {
      await createNewSession();
    }
  }

  async function requestAssistant(
    messages: ProviderMessage[],
    options?: {
      forceTitleTool?: boolean;
      shouldSetTitle?: boolean;
    },
  ) {
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const toolChoice = options?.forceTitleTool
      ? {
          function: {
            name: "set_session_title",
          },
          type: "function" as const,
        }
      : "auto";

    const response = await fetch(getEndpoint(aiConfig), {
      body: JSON.stringify({
        messages: [
          {
            content: buildSystemPrompt(Boolean(options?.shouldSetTitle)),
            role: "system",
          },
          ...messages,
        ],
        model: getModel(aiConfig),
        stream: true,
        tool_choice: toolChoice,
        tools: TOOL_DEFINITIONS,
      }),
      headers: getHeaders(aiConfig),
      method: "POST",
      signal: abortController.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "The AI request failed.");
    }

    if (!response.body) {
      throw new Error("The AI response did not provide a stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    let role: ProviderMessage["role"] = "assistant";
    const toolCalls = new Map<number, ToolCall>();

    const processEvent = (rawEvent: string) => {
      const lines = rawEvent
        .split("\n")
        .map((line) => line.trimEnd())
        .filter(Boolean);

      const dataLines = lines
        .filter((line) => !line.startsWith(":"))
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim());

      if (dataLines.length === 0) {
        return false;
      }

      const payload = dataLines.join("\n");
      if (payload === "[DONE]") {
        return true;
      }

      const chunk = JSON.parse(payload) as StreamChunk;
      if (chunk.error?.message) {
        throw new Error(chunk.error.message);
      }

      const choice = chunk.choices?.[0];
      const delta = choice?.delta;
      if (!delta) {
        return false;
      }

      if (delta.role) {
        role = delta.role;
      }

      if (delta.content) {
        content += delta.content;
        updateAssistantMessage(setChatHistory, content);
      }

      for (const partialToolCall of delta.tool_calls ?? []) {
        const index = partialToolCall.index ?? 0;
        const existing = toolCalls.get(index) ?? {
          function: {
            arguments: "",
            name: "",
          },
          id: partialToolCall.id ?? `tool-call-${index}`,
          type: "function",
        };

        toolCalls.set(index, {
          function: {
            arguments:
              existing.function.arguments + (partialToolCall.function?.arguments ?? ""),
            name: existing.function.name || partialToolCall.function?.name || "",
          },
          id: partialToolCall.id ?? existing.id,
          type: "function",
        });
      }

      return choice?.finish_reason != null;
    };

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const shouldStop = processEvent(event);
        if (shouldStop) {
          reader.releaseLock();
          return {
            content,
            role,
            tool_calls: Array.from(toolCalls.values()),
          } satisfies ProviderMessage;
        }
      }

      if (done) {
        break;
      }
    }

    if (buffer.trim()) {
      processEvent(buffer);
    }

    return {
      content,
      role,
      tool_calls: Array.from(toolCalls.values()),
    } satisfies ProviderMessage;
  }

  function cancelGeneration() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setGenerating(false);
    updateAssistantMessage(setChatHistory, "Canceled.");
  }

  async function executeToolCall(toolCall: ToolCall): Promise<ProviderMessage> {
    const args = parseToolArguments(toolCall.function.arguments);

    if (toolCall.function.name === "get_playground_state") {
      const files = playgroundRef.current?.getFiles() ?? currentFilesRef.current;
      return {
        content: JSON.stringify({ files }, null, 2),
        role: "tool",
        tool_call_id: toolCall.id,
      };
    }

    if (toolCall.function.name === "set_session_title") {
      const title =
        typeof args.title === "string" ? args.title.trim().replace(/\s+/g, " ") : "";

      if (!title) {
        throw new Error("set_session_title requires a non-empty title.");
      }

      setCurrentSessionName(title);

      return {
        content: JSON.stringify({ title }, null, 2),
        role: "tool",
        tool_call_id: toolCall.id,
      };
    }

    if (toolCall.function.name === "search_custom_element_docs") {
      const query = typeof args.query === "string" ? args.query : "";
      return {
        content: searchCustomElementDocs(query),
        role: "tool",
        tool_call_id: toolCall.id,
      };
    }

    if (toolCall.function.name === "update_playground_files") {
      const nextFiles: Partial<PlaygroundFiles> = {};
      if (typeof args.html === "string") {
        nextFiles["index.html"] = args.html;
      }
      if (typeof args.tsx === "string") {
        nextFiles["index.tsx"] = args.tsx;
      }

      if (Object.keys(nextFiles).length === 0) {
        throw new Error("update_playground_files requires at least one of html or tsx.");
      }

      playgroundRef.current?.setFiles(nextFiles);

      const mergedFiles = {
        ...currentFilesRef.current,
        ...nextFiles,
      };
      currentFilesRef.current = mergedFiles;
      setCurrentFiles(mergedFiles);

      if (args.rerender !== false) {
        await playgroundRef.current?.pushCode();
      }

      return {
        content: JSON.stringify(
          {
            files: mergedFiles,
            rerendered: args.rerender !== false,
            summary: typeof args.summary === "string" ? args.summary : null,
            updated: Object.keys(nextFiles),
          },
          null,
          2,
        ),
        role: "tool",
        tool_call_id: toolCall.id,
      };
    }

    throw new Error(`Unknown tool: ${toolCall.function.name}`);
  }

  async function generateWithAI() {
    if (!aiPrompt.trim() || generating) {
      return;
    }

    const shouldSetTitle = chatHistory.length === 0;
    const userMessage = aiPrompt.trim();
    const userChatMessage: ChatMessage = {
      content: userMessage,
      role: "user",
    };
    const nextConversation = [
      ...conversationHistory,
      { content: userMessage, role: "user" as const },
    ];

    setChatHistory((prev) => [...prev, userChatMessage, { content: "", role: "assistant" }]);
    setConversationHistory(nextConversation);
    setAiPrompt("");
    setGenerating(true);

    try {
      let messages = [...nextConversation];
      let finalAssistantText = "";

      for (let step = 0; step < 8; step += 1) {
        const assistantMessage = await requestAssistant(messages, {
          forceTitleTool: shouldSetTitle && step === 0,
          shouldSetTitle: shouldSetTitle && step === 0,
        });
        messages = [...messages, assistantMessage];

        const toolCalls = assistantMessage.tool_calls ?? [];
        if (toolCalls.length === 0) {
          finalAssistantText =
            normalizeAssistantContent(assistantMessage.content) || "Updated the playground.";
          break;
        }

        for (const toolCall of toolCalls) {
          updateAssistantMessage(setChatHistory, formatToolStatus(toolCall));
          const toolResult = await executeToolCall(toolCall);
          messages = [...messages, toolResult];
        }
      }

      const assistantChatMessage: ChatMessage = {
        content: finalAssistantText || "Updated the playground.",
        role: "assistant",
      };

      setConversationHistory(messages);
      updateAssistantMessage(setChatHistory, assistantChatMessage.content);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      updateAssistantMessage(
        setChatHistory,
        error instanceof Error ? error.message : "The AI request failed.",
      );
    } finally {
      abortControllerRef.current = null;
      setGenerating(false);
    }
  }

  useEffect(() => {
    currentFilesRef.current = currentFiles;
  }, [currentFiles]);

  useEffect(() => {
    if (!showProviderPopover) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (providerPopoverRef.current?.contains(target)) {
        return;
      }

      setShowProviderPopover(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showProviderPopover]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("docs_playground_ai_config", JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    void loadSessionsList();
  }, []);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    if (chatHistory.length === 0) {
      return;
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      void saveCurrentSession();
    }, 1200);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [chatHistory, currentFiles, currentSessionName]);

  return (
    <div className={twMerge("flex min-h-0 flex-1 flex-col", className)}>
      <div className="flex shrink-0 flex-col border-black/10 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="font-semibold text-sm">AI Assistant</div>
            <div className="mt-0.5 text-[11px] opacity-60">{providerLabel}</div>
          </div>

          <div className="relative flex items-center gap-2" ref={providerPopoverRef}>
            <button
              type="button"
              onClick={() => setShowProviderPopover((prev) => !prev)}
              className="rounded-full border border-black/10 px-3 py-1.5 font-medium text-xs transition-colors hover:bg-black/5"
              aria-expanded={showProviderPopover}
            >
              Model
            </button>
            <button
              type="button"
              onClick={() => void createNewSession()}
              className="rounded p-1 text-xs hover:bg-black/5"
            >
              New
            </button>
            <button
              type="button"
              onClick={() => void saveCurrentSession()}
              className="rounded p-1 text-xs hover:bg-black/5"
            >
              Save
            </button>

            {showProviderPopover && (
              <div className="absolute top-full right-0 z-20 mt-2 w-80 rounded-2xl border border-black/10 bg-white p-3 shadow-lg">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] opacity-50">
                  Provider
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiConfig((prev) => ({ ...prev, provider: "openrouter" }))}
                    className={twMerge(
                      "rounded-xl border px-3 py-2 text-left transition-colors",
                      aiConfig.provider === "openrouter"
                        ? "border-black bg-black text-white"
                        : "border-black/10 hover:bg-black/5",
                    )}
                  >
                    <div className="font-medium text-xs">OpenRouter</div>
                    <div
                      className={twMerge(
                        "mt-1 text-[11px]",
                        aiConfig.provider === "openrouter" ? "text-white/70" : "opacity-60",
                      )}
                    >
                      Cloud API
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiConfig((prev) => ({ ...prev, provider: "ollama" }))}
                    className={twMerge(
                      "rounded-xl border px-3 py-2 text-left transition-colors",
                      aiConfig.provider === "ollama"
                        ? "border-black bg-black text-white"
                        : "border-black/10 hover:bg-black/5",
                    )}
                  >
                    <div className="font-medium text-xs">Ollama</div>
                    <div
                      className={twMerge(
                        "mt-1 text-[11px]",
                        aiConfig.provider === "ollama" ? "text-white/70" : "opacity-60",
                      )}
                    >
                      Local model
                    </div>
                  </button>
                </div>

                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] opacity-50">
                  Configuration
                </div>

                <div className="space-y-3 text-xs">
                  {aiConfig.provider === "openrouter" ? (
                    <>
                      <div>
                        <label
                          htmlFor="openrouter-api-key"
                          className="mb-1 block font-medium opacity-70"
                        >
                          API key
                        </label>
                        <input
                          id="openrouter-api-key"
                          type="password"
                          value={aiConfig.openrouterApiKey}
                          onChange={(event) =>
                            setAiConfig((prev) => ({
                              ...prev,
                              openrouterApiKey: event.target.value,
                            }))
                          }
                          placeholder="sk-or-v1-..."
                          className="w-full rounded border border-black/10 bg-transparent px-2 py-1.5"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="openrouter-model"
                          className="mb-1 block font-medium opacity-70"
                        >
                          Model
                        </label>
                        <input
                          id="openrouter-model"
                          type="text"
                          value={aiConfig.openrouterModel}
                          onChange={(event) =>
                            setAiConfig((prev) => ({
                              ...prev,
                              openrouterModel: event.target.value,
                            }))
                          }
                          className="w-full rounded border border-black/10 bg-transparent px-2 py-1.5"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label
                          htmlFor="ollama-endpoint"
                          className="mb-1 block font-medium opacity-70"
                        >
                          Endpoint
                        </label>
                        <input
                          id="ollama-endpoint"
                          type="text"
                          value={aiConfig.ollamaEndpoint}
                          onChange={(event) =>
                            setAiConfig((prev) => ({
                              ...prev,
                              ollamaEndpoint: event.target.value,
                            }))
                          }
                          className="w-full rounded border border-black/10 bg-transparent px-2 py-1.5"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="ollama-model"
                          className="mb-1 block font-medium opacity-70"
                        >
                          Model
                        </label>
                        <input
                          id="ollama-model"
                          type="text"
                          value={aiConfig.ollamaModel}
                          onChange={(event) =>
                            setAiConfig((prev) => ({
                              ...prev,
                              ollamaModel: event.target.value,
                            }))
                          }
                          className="w-full rounded border border-black/10 bg-transparent px-2 py-1.5"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {chatHistory.length > 0 && (
          <div className="border-black/10 border-t px-4 py-2">
            <input
              type="text"
              value={currentSessionName}
              onChange={(event) => setCurrentSessionName(event.target.value)}
              placeholder="Session name..."
              className="w-full rounded border border-black/10 bg-transparent px-2 py-1.5 text-xs"
            />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {chatHistory.length === 0 && !generating && (
          <div className="space-y-3">
            <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3 text-xs">
              <div className="font-semibold">AI Playground</div>
              <div className="mt-2 space-y-1.5 opacity-80">
                <div>Use OpenRouter with an API key or Ollama locally.</div>
                <div>
                  The assistant can inspect the current files and update the playground with tool
                  calls.
                </div>
                <div>
                  Press <kbd className="rounded bg-black/5 px-1.5 py-0.5">Cmd+B</kbd> to switch
                  between Code and AI.
                </div>
              </div>
            </div>

            {sessions.length > 0 && (
              <div className="space-y-2">
                <div className="px-2 py-2 font-semibold text-xs opacity-70">Previous Sessions</div>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="group relative rounded-lg p-3 text-xs transition-colors hover:bg-black/5"
                  >
                    <button
                      type="button"
                      onClick={() => void loadSessionById(session.id)}
                      className="w-full text-left"
                    >
                      <div className="mb-1 truncate font-semibold">{session.name}</div>
                      <div className="opacity-60">{formatSessionDate(session.timestamp)}</div>
                      <div className="opacity-50">
                        {session.chatHistory.length} message
                        {session.chatHistory.length !== 1 ? "s" : ""}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDeleteSession(session.id);
                      }}
                      className="absolute top-2 right-2 rounded p-1 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {chatHistory.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={twMerge(
              "rounded-lg p-3 text-xs",
              message.role === "user"
                ? "ml-4 bg-black/5"
                : "mr-4 border border-black/10 bg-white",
            )}
          >
            <div className="mb-1 font-semibold opacity-70">
              {message.role === "user" ? "You" : "AI"}
            </div>
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          </div>
        ))}

        {generating && (
          <div className="mr-4 flex items-center gap-1 px-3 text-black/45">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
          </div>
        )}
      </div>

      <div className="shrink-0 border-black/10 border-t px-4 py-3">
        <div className="flex gap-2">
          <textarea
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !generating) {
                event.preventDefault();
                void generateWithAI();
              }
            }}
            placeholder="Describe a change to the playground..."
            className="min-h-24 flex-1 resize-none rounded border border-black/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <button
            type="button"
            className="self-end rounded bg-black px-3 py-2 font-medium text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            onClick={() => {
              if (generating) {
                cancelGeneration();
                return;
              }

              void generateWithAI();
            }}
            disabled={!generating && !aiPrompt.trim()}
          >
            {generating ? "Cancel" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

package main

import (
	"fmt"
	"os"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
)

type model struct {
	choices  []string
	cursor   int
	selected map[int]struct{}
	submit   bool
	cancel   bool
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {

	case tea.KeyMsg:
		switch msg.String() {

		case "ctrl+c", "q":
			m.cancel = true
			return m, tea.Quit

		case "up", "k":
			if m.cursor > 0 {
				m.cursor--
			}
		case "down", "j":
			if m.cursor < len(m.choices)-1 {
				m.cursor++
			}

		case " ":
			_, ok := m.selected[m.cursor]
			if ok {
				delete(m.selected, m.cursor)
			} else {
				m.selected[m.cursor] = struct{}{}
			}

		case "enter":
			m.submit = true
			return m, tea.Quit
		}
	}

	return m, nil
}

func (m model) View() string {
	if m.submit || m.cancel {
		return ""
	}

	s := "Select components to use:\n\n"

	for i, choice := range m.choices {
		cursor := " "
		if m.cursor == i {
			cursor = "|"
		}

		checked := " "
		if _, ok := m.selected[i]; ok {
			checked = "✔︎"
		}

		s += fmt.Sprintf("%s %s %s\n", cursor, checked, choice)
	}

	return s
}

func initialModel() model {
	return model{
		choices: func() []string {
			templates, err := getTemplates()
			if err != nil {
				fmt.Println("✘", err)
				os.Exit(1)
			}

			var choices []string
			for _, template := range templates {
				choices = append(choices, strings.Split(template.Name(), ".")[0])
			}
			return choices
		}(),

		selected: make(map[int]struct{}),

		cancel: false,
		submit: false,
	}
}

func main() {
	args := os.Args[1:]

	if len(args) > 0 {
		for _, arg := range args {
			n, err := useTemplate(arg)
			_ = n

			if err != nil {
				fmt.Println("✘", err)
				os.Exit(1)
			}

			fmt.Println("✔︎ Used", arg)
		}
		return
	}

	p := tea.NewProgram(initialModel())

	if m, err := p.Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	} else {
		m := m.(model)

		if m.cancel {
			fmt.Println("Canceled")
			return
		}

		for i := range m.selected {
			name := m.choices[i]
			n, err := useTemplate(name)
			_ = n

			if err != nil {
				fmt.Println("✘", err)
				os.Exit(1)
				break
			}

			fmt.Println("✔︎ Used", name)
		}
	}
}

<script lang="ts" setup>
import "../src/index.js";

function openPalatte() {
  const palatte = document.querySelector("a-palatte");
  palatte && palatte.open();
}
</script>

<template>
  <Story group="input">
    <div class="page">
      <a-palatte shortcut="Space" placeholder="Search">
        <div class="prefix" slot="before-input">
          <svg
            height="12px"
            viewBox="0 0 165 165"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M49 150L117 82L49 14"
              stroke="currentColor"
              stroke-width="24"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div class="item" @click="console.log">Some Item 1</div>
        <div class="item" @click="console.log">Some Item 2</div>
        <div class="item" @click="console.log">Some Item 3</div>
        <div class="item" @click="console.log">Some Item 4</div>
        <div class="item" @click="console.log">Some Item 5</div>
      </a-palatte>

      <center>
        <div>
          <h1>Palette</h1>
          <p>Press <code>Cmd + Space</code> to open palette.</p>
          <p>Or click <button @click="() => openPalatte()">Open</button></p>
        </div>
      </center>
    </div>
  </Story>
</template>

<style scoped>
.page {
  min-height: 600px;
}

.item {
  padding: 8px;
  margin-top: 4px;
  cursor: pointer;
  border-radius: 4px;
}

.item[selected] {
  background: #fff;
}

.prefix {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  margin-right: 10px;
}

a-palatte {
  color: #333;
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
}
</style>

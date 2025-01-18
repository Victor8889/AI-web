<template>
  <div class="yellow-box">
    <div class="blue-box">
      <img src="/src/assets/js.png" class="icon">
      <span class="text">本站只用于技术预览和学习。如果您在国内违反法律使用此站点，会受到监管，
        并且内容或帐号可能会被清除，而且不会提前通知。请使用邮箱进行注册和登录。</span>
    </div>
  </div>
</template>

  <style>
  .yellow-box {
    background-color: rgb(255, 234, 117);
  }

  .blue-box {
    background-color: rgb(253, 255, 118);
    color: white;
  display: flex;
  align-items: center;
  }
  .icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
  .text {
  font-size: smaller;
  color: rgb(0, 0, 0);
  word-wrap: break-word;
}
  </style>

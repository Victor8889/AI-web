<script>
export default {
  props: {
    iconPath: String, // 图标路径
    customClass: String, // 自定义类名
    customStyle: Object, // 自定义样式对象
  },
}
</script>

<template>
  <i :class="customClass" :style="customStyle">
    <svg class="icon" aria-hidden="true">
      <use :href="iconPath" />
    </svg>
  </i>
</template>

  <style scoped>
  .icon {
    /* 根据需要设置图标的样式 */
  }
  </style>

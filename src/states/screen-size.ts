import { shallowReactive } from 'vue';

const size = shallowReactive({
  width: 0,
  height: 0,
});

const updateSize = () => {
  const screen = window.screen;
  const pixelRatio = window.devicePixelRatio;
  size.width = (screen.width * pixelRatio) | 0;
  size.height = (screen.height * pixelRatio) | 0;
};

updateSize();

window.addEventListener('resize', updateSize);

export default size;

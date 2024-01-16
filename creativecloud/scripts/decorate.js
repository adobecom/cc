export default function defineDeviceByScreenSize() {
  const DESKTOP_SIZE = 1200;
  const MOBILE_SIZE = 600;
  const screenWidth = window.innerWidth;
  if (screenWidth >= DESKTOP_SIZE) {
    return 'DESKTOP';
  }
  if (screenWidth <= MOBILE_SIZE) {
    return 'MOBILE';
  }
  return 'TABLET';
}

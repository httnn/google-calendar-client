export function textContrast(hexcolor) {
  const [, red, green, blue] = hexcolor.match(
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
  );
  const lightness =
    (0.3 * parseInt(red, 16)) / 255 +
    (0.59 * parseInt(green, 16)) / 255 +
    (0.11 * parseInt(blue, 16)) / 255;
  return lightness > 0.5 ? 'black' : 'white';
}

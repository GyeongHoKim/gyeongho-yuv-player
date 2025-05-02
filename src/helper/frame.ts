type Format = 'I420' | 'I420A' | 'I422' | 'I444' | 'NV12' | 'RGBA' | 'RGBX' | 'BGRA' | 'BGRX';

export function createVideoFrameFromData(
  format: Format,
  data: Uint8Array,
  width: number,
  height: number
): VideoFrame {
  let layout: PlaneLayout[] | undefined = undefined;

  switch (format) {
    case 'I420': {
      const ySize = width * height;
      const uSize = (width / 2) * (height / 2);
      layout = [
        { offset: 0, stride: width },
        { offset: ySize, stride: width / 2 },
        { offset: ySize + uSize, stride: width / 2 },
      ];
      break;
    }
    case 'I420A': {
      const ySize = width * height;
      const uSize = (width / 2) * (height / 2);
      const vSize = uSize;
      layout = [
        { offset: 0, stride: width },
        { offset: ySize, stride: width / 2 },
        { offset: ySize + uSize, stride: width / 2 },
        { offset: ySize + uSize + vSize, stride: width },
      ];
      break;
    }
    case 'I422': {
      const ySize = width * height;
      const uSize = (width / 2) * height;
      layout = [
        { offset: 0, stride: width },
        { offset: ySize, stride: width / 2 },
        { offset: ySize + uSize, stride: width / 2 },
      ];
      break;
    }
    case 'I444': {
      const ySize = width * height;
      layout = [
        { offset: 0, stride: width },
        { offset: ySize, stride: width },
        { offset: ySize * 2, stride: width },
      ];
      break;
    }
    case 'NV12': {
      const ySize = width * height;
      layout = [
        { offset: 0, stride: width },
        { offset: ySize, stride: width },
      ];
      break;
    }
    case 'RGBA':
    case 'RGBX':
    case 'BGRA':
    case 'BGRX':
      layout = undefined;
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  const init: VideoFrameBufferInit = {
    format,
    codedWidth: width,
    codedHeight: height,
    timestamp: performance.now(),
    layout,
  };

  return new VideoFrame(data, init);
}
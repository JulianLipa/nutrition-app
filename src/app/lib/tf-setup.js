import * as tf from '@tensorflow/tfjs';

let tfInitialized = false;

export const setupTF = async () => {
  if (tfInitialized) return;
  tfInitialized = true;

  await tf.ready();
};
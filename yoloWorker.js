// yoloWorker.js
importScripts('https://cdn.jsdelivr.net/npm/@ultralytics/yolov8/dist/yolov8.min.js');

let model;

async function loadModel() {
    model = await YOLO.load('yolov8n'); // small & fast for browser
    postMessage({type:'loaded'});
}

loadModel();

// Receive frames from main thread
onmessage = async (e) => {
    if(!model) return;
    const { imageData } = e.data;
    const bitmap = await createImageBitmap(imageData);

    const results = await model.detect(bitmap, { conf:0.25 });
    const birds = results
        .filter(r => r.class.toLowerCase() === 'bird')
        .map(r => ({
            x: r.box[0],
            y: r.box[1],
            w: r.box[2] - r.box[0],
            h: r.box[3] - r.box[1],
            cx: (r.box[0] + r.box[2])/2,
            cy: (r.box[1] + r.box[3])/2
        }));

    postMessage({ type:'detections', birds });
};

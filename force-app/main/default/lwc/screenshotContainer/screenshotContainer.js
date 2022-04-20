import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import html2canvas from '@salesforce/resourceUrl/html2canvas';

export default class ScreenshotContainer extends LightningElement {
    imgsrc = '';

    renderedCallback() {
        console.log('html2canvas', html2canvas);
        loadScript(this, html2canvas + '/html2canvas.js').then(() => {
            console.log('html2canvas loaded');
        });

        // Promise.all([
        //     loadScript(this, html2canvas)
        // ]) .then(() => {
        //     console.log('html2canvas loaded');
        // })
    }

    // option 1 - try to screenshot browser from inside lwc
    generateScreenshot(){
        const screenshotTarget = document.body;
        console.log('document.body');
        console.log(screenshotTarget);
        html2canvas(document.body).then((canvas) => {
            console.log('canvas');
            console.log(canvas);
            const base64image = canvas.toDataURL("image/png");
            window.location.href = base64image;
        });

        // html2canvas(document.body).then(canvas => {
        //     let newWindow = window.open();
        //     newWindow.document.body.appendChild(canvas);
        // }, error => {
        //     console.error(error);
        //  });
    }

    // option 2 - try to screenshot from div
    printDiv() {
        console.log('hitting printDiv()');
            html2canvas(this.template.querySelector('.print-preview-div'),{ 
                scale: "5",
                onrendered: (canvas)=> {
                    console.log('canvas');
                    console.log(canvas);
                    //show image
                    var myCanvas = this.template.querySelector('.my_canvas_id');
                    var ctx = myCanvas.getContext('2d');
                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.mozImageSmoothingEnabled = false;
                    ctx.imageSmoothingEnabled = false;
                    var img = new Image;
                    img.onload = function(){
                        ctx.drawImage(img,0,0,270,350); // Or at whatever offset you like
                    };
                    console.log('img >> ', canvas.toDataURL());
                    img.src = canvas.toDataURL();
                    this.imgsrc = img.src;
                }
            });
    }
}

   // html2canvas(this.template.querySelector('.print-preview-div'))
        //     .then((canvas) => {
        //         console.log('canvas');
        //         console.log(canvas);
        //         var myCanvas = this.template.querySelector('.my_canvas_id');
        //         var ctx = myCanvas.getContext('2d');
        //         ctx.webkitImageSmoothingEnabled = false;
        //         ctx.mozImageSmoothingEnabled = false;
        //         ctx.imageSmoothingEnabled = false;
        //         var img = new Image;
        //         img.onload = function(){
        //             ctx.drawImage(img,0,0,270,350); // Or at whatever offset you like
        //         };
        //         console.log('img >> ', canvas.toDataURL());
        //         img.src = canvas.toDataURL();
        //         this.imgsrc = img.src;
        //     });
import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import jszip from '@salesforce/resourceUrl/jszip';

export default class ZipFilesUploaded extends LightningElement {

    renderedCallback() {
        console.log('jszip', jszip);
        loadScript(this, jszip + '/jszip.js').then(() => {
            console.log('jszip loaded');
        });
    }

    handleFiles(event){
        /*
            * Default name of the document will be the filename without the
            * file extension and current timestamp appended for version.
            */
        // const dateNow = Math.floor(Date.now() / 1000); // Timestamp without milliseconds.
        // this.docName = event.target.files[0].name.split('.').slice(0, -1).join('.') + '__v' + dateNow;
        // fireEvent(this.pageRef, 'newfileAdded', event.target.files[0]);
        console.log('files selected');
        console.log(event.target.files);
        this.handleZipping(event.target.files);
    }

    handleNewFileAdded(file) {
        this.iframeWindow.postMessage({
            type: 'SAVE_NEW_DOCUMENT',
            file: file
        });
    }

    handleZipping(files){
        console.log('files received');
        console.log(files);
        var zip = new jszip();
        console.log(zip);
        zip.file(files);
        var img = zipFile.folder("images");
        zip.generateAsync({type:"blob"})
            .then(function(content) {
                // see FileSaver.js
                saveAs(content, "example.zip");
            });
    }

    test(){
        console.log('testing');
        // create a file
        jszip.file("Hello.txt", "Hello World\n");
        var img = jszip.folder("images");
        img.file("smile.gif", imgData, {base64: true});
        jszip.generateAsync({type:"blob"})
        .then((content) => {
            console.log('.then');
            console.log(content);
            // see FileSaver.js
            // saveAs(content, "example.zip");
        });
    }

}
/* global d3 */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import D3 from '@salesforce/resourceUrl/d3';
import DATA from './data';
import SalesforceApi from 'c/salesforceApi';
import getSessionId from '@salesforce/apex/UserSession.getSessionId';

export default class D3screenshot extends LightningElement {
    svgWidth = 400;
    svgHeight = 400;

    d3Initialized = false;
    baseUrl;

    renderedCallback() {
        if (this.d3Initialized) {
            return;
        }
        this.d3Initialized = true;

        Promise.all([
            loadScript(this, D3 + '/d3.js'),
            loadStyle(this, D3 + '/style.css')
        ])
            .then(() => {
                this.initializeD3();
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading D3',
                        message: error.message,
                        variant: 'error'
                    })
                );
            });
    }

    connectedCallback(){
        const subdomains = window.location.host.split('.');
        this.baseUrl = subdomains[0];
    }

    initializeD3() {
        // Example adopted from https://bl.ocks.org/mbostock/2675ff61ea5e063ede2b5d63c08020c7
        const svg = d3.select(this.template.querySelector('svg.d3'));
        const width = this.svgWidth;
        const height = this.svgHeight;
        const color = d3.scaleOrdinal(d3.schemeDark2);

        const simulation = d3
            .forceSimulation()
            .force(
                'link',
                d3.forceLink().id((d) => {
                    return d.id;
                })
            )
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(width / 2, height / 2));

        const link = svg
            .append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(DATA.links)
            .enter()
            .append('line')
            .attr('stroke-width', (d) => {
                return Math.sqrt(d.value);
            });

        const node = svg
            .append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(DATA.nodes)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('fill', (d) => {
                return color(d.group);
            })
            .call(
                d3
                    .drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended)
            );

        node.append('title').text((d) => {
            return d.id;
        });

        simulation.nodes(DATA.nodes).on('tick', ticked);

        simulation.force('link').links(DATA.links);

        function ticked() {
            link.attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('x2', (d) => d.target.x)
                .attr('y2', (d) => d.target.y);
            node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
        }

        function dragstarted(d) {
            if (!d3.event.active) {
                simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) {
                simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
        }
    }

    screenshotData(){
        console.log('screenshotData()');
        // option 1

        // const s = new XMLSerializer().serializeToString(this.template.querySelector('svg'));
        // const encodedData = window.btoa(s);
        // console.log(encodedData);
        // var b64start = 'data:image/svg+xml;base64,';
        // var image64 = b64start + encodedData;
        // console.log(image64);
        // // this.saveImageToServer(image64);

        // var canvas = document.createElement("canvas");
        // var context = canvas.getContext("2d");
        // canvas.width = width;
        // canvas.height = height;
        // var image = new Image();
        // image.onload = function() {
        //     context.clearRect ( 0, 0, width, height );
        //     context.drawImage(image, 0, 0, width, height);
        //     canvas.toBlob( function(image64) {
        //         var filesize = Math.round( image64.length/1024 ) + ' KB';
        //         if ( callback ) callback( image64, filesize );
        //     });
        // };
        // image.src = imgsrc;

        // option 2

        // const svgString = new XMLSerializer().serializeToString(this.template.querySelector('svg'));
        // console.log(svgString); // contains all the NS attributes

        // const blob = new Blob([svgString], { type: "image/svg+xml" });
        // const img = new Image();
        // img.src = URL.createObjectURL(blob);
        // console.log(img.src);
        // this.saveImageToServer(img.src);

        // option 3
        var svgElement = this.template.querySelector('svg.d3');
        let {width, height} = svgElement.getBBox();
        let clonedSvgElement = svgElement.cloneNode(true);
        let outerHTML = clonedSvgElement.outerHTML,
            blobSvg = new Blob([outerHTML],{type:'image/svg+xml;charset=utf-8'});
        console.log('blobSvg');
        console.log(blobSvg);
        console.log(window.location.href);
        let URL = window.location.href;
        let blobURL = URL.createObjectURL(blobSvg);
        console.log('blobURL');
        console.log(blobURL);

        let image = new Image();
        image.onload = () => {
            console.log('image onload');
           let canvas = document.createElement('canvas');
           canvas.widht = width;
           canvas.height = height;
           let context = canvas.getContext('2d');
           // draw image in canvas starting left-0 , top - 0  
           context.drawImage(image, 0, 0, width, height );
          //  downloadImage(canvas); need to implement
        };
        image.src = blobURL;
        console.log('blobURL');
        console.log(blobURL);
        let png = canvas.toDataURL(); // default png
        this.saveImageToServer(blobURL);
       
        // this.saveImageToServer(blobURL);
        // this.download(png, "image.png");
    }

    download(href, name) {
        console.log('downloading');
        var link = document.createElement('a');
        link.download = name;
        link.style.opacity = "0";
        document.append(link);
        link.href = href;
        link.click();
        link.remove();
    }
      

    saveImageToServer(blobURL) {
        console.log('saveImageToServer()');
        // this.updateTextLoading = 'Saving to PDF to Annual File';
        // create file name
        const dateNow = new Date().toLocaleDateString();
        const docName = 'd3Data' + '_' + dateNow;

        // create contentDocument for payload
        const contentDocument = {
            Title: docName,
            PathOnClient: '.png'
            // FirstPublishLocationId: this.recordId
        };
        // retrieve session id for payload
        getSessionId()
            .then(id => {
                const sessionId = id;
                try {
                    const api = new SalesforceApi(`https://${this.baseUrl}.cs41.my.salesforce.com`, 'v46.0', sessionId);
                    api.createBlob('ContentVersion', contentDocument, docName, 'VersionData', blobURL, (res) => {
                        console.log('Image Saved!', res);
                        console.log(res.id);
                    })
                } catch (error) {
                    console.error('Bad API Request, check company storage', error);
                    // this.updateText = 'Check Storage';
                    // this.isLoading = false;
                }
            })
            .catch(error => {
                console.error('getSessionId error', error);
                // this.updateText = 'getSessionId error';
                // this.isLoading = false;
            });
    }
}
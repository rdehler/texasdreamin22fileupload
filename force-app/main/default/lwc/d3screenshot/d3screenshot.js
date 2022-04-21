/* global d3 */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import D3 from '@salesforce/resourceUrl/d3';
import DATA from './data';

export default class D3screenshot extends LightningElement {
    svgWidth = 400;
    svgHeight = 400;

    d3Initialized = false;

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
        console.log('hit screenshotData()');
        // get svg tag
        var svgElement = this.template.querySelector('svg');
        console.log('svgElement');
        console.log(svgElement);
        let {width, height} = svgElement.getBBox();
        let clonedSvgElement = svgElement.cloneNode(true);
        let outerHTML = clonedSvgElement.outerHTML,
            blobURL = new Blob([outerHTML],{type:'image/svg+xml;charset=utf-8'});
        console.log('outerHTML');
        console.log(outerHTML);
        // create screenshot image
        console.log('blobURL');
        console.log(blobURL);

        let image = new Image();
        image.onload = () => {
            console.log('image onload');
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            let context = canvas.getContext('2d');
            // draw image in canvas starting left-0 , top - 0  
            context.drawImage(image, 0, 0, width, height );
            //  downloadImage(canvas); need to implement
        };
        image.src = blobURL;
        // donwload canvas as image
        let png = canvas.toDataURL(); // default png
        let jpeg = canvas.toDataURL('image/jpg');
        let webp = canvas.toDataURL('image/webp');

        console.log('png');
        console.log(png);

        this.download(png, "image.png");
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
      
}
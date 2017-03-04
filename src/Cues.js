'use strict';
var CueTrackPositions = require('./CueTrackPositions.js');

/**
 * @classdesc This class keeps track of keyframes for seeking
 * 76514630 - 43 - 8
 */

class Cues {

    constructor(cuesHeader, dataInterface, demuxer) {
        this.dataInterface = dataInterface;
        this.offset = cuesHeader.offset;
        this.size = cuesHeader.size;
        this.end = cuesHeader.end;
        this.entries = [];
        this.loaded = false;
        this.tempEntry = null;
        this.demuxer = demuxer;
        this.currentElement = null;
    }

    load() {
        var end = this.end;
        while (this.dataInterface.offset < end) {
            if (!this.currentElement) {
                this.currentElement = this.dataInterface.peekElement();
                if (this.currentElement === null)
                    return null;
            }


            switch (this.currentElement.id) {

                case 0xBB: //CuePoint
                    if (!this.tempEntry)
                        this.tempEntry = new CuePoint(this.currentElement, this.dataInterface);
                    this.tempEntry.load();
                    if (!this.tempEntry.loaded)
                        return;
                    else
                        this.entries.push(this.tempEntry);
                    break;
                    //TODO, ADD VOID
                default:
                    console.warn("Cue Head element not found"); // probably bad
                    break;

            }

            this.tempEntry = null;
            this.currentElement = null;
            //this.cueTrackPositions = this.tempEntry;
            //this.tempEntry = null;
        }


        if (this.dataInterface.offset !== this.end) {
            console.log(this);
            throw "INVALID CUE FORMATTING";
        }

        this.loaded = true;
        //console.warn(this);
    }

    getCount() {
        return this.cuePoints.length;
    }

    init() {

    }

    preloadCuePoint() {

    }

    find() {

    }

    getFirst() {

    }

    getLast() {

    }

    getNext() {

    }

    getBlock() {

    }

    findOrPreloadCluster() {

    }

}

class CuePoint {

    constructor(cuesPointHeader, dataInterface) {
        this.dataInterface = dataInterface;
        this.offset = cuesPointHeader.offset;
        this.size = cuesPointHeader.size;
        this.end = cuesPointHeader.end;
        this.loaded = false;
        this.tempElement = null;
        this.currentElement = null;
        this.cueTime = null;
        this.cueTrackPositions = null;
    }

    load() {
        var end = this.end;
        while (this.dataInterface.offset < end) {
            if (!this.currentElement) {
                this.currentElement = this.dataInterface.peekElement();
                if (this.currentElement === null)
                    return null;
            }


            switch (this.currentElement.id) {
                case 0xB7: //Cue Track Positions
                    if (!this.cueTrackPositions)
                        this.cueTrackPositions = new CueTrackPositions(this.currentElement, this.dataInterface);
                    this.cueTrackPositions.load();
                    if (!this.cueTrackPositions.loaded)
                        return;
                    break;

                case 0xB3: //Cue Time 
                    var cueTime = this.dataInterface.readUnsignedInt(this.currentElement.size);
                    if (cueTime !== null)
                        this.cueTime = cueTime;
                    else
                        return null;
                    break;



                default:
                    console.warn("Cue Point not found, skipping");
                    break;

            }

            this.currentElement = null;
        }

        this.loaded = true;
    }

}



module.exports = Cues;
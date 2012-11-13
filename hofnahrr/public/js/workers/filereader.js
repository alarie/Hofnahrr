/*global self, FileReaderSync */
/*var DataViewShim = function () {
    var arrayBuffer = new ArrayBuffer(this.data.length),
        int8View = new Int8Array(arrayBuffer),
            i;
    
    for (i = 0; i &lt; this.data.length; i++) {
        int8View[i] = this.data[i].charCodeAt(0);
    }
    
    this.buffer = arrayBuffer;
};
 
DataViewShim.prototype = {
    getByteAt : function (offset) {
        
    },

    getUint8 : function(offset) {
        if (compatibility.ArrayBuffer) {
    
        return new Uint8Array(this.buffer, offset, 1)[0];
        }
        else {
            return this.data.charCodeAt(offset) &amp; 0xff;
        }
    },

    getLongAt : function(offset,littleEndian) {
    
        ////DataView method
        //return new DataView(this.buffer).getUint32(offset, littleEndian);
    
        ////ArrayBufferView method always littleEndian
        //var uint32Array = new Uint32Array(this.buffer);
        //return uint32Array[offset];
    
        //The method we are currently using
        var b3 = this.getUint8(this.endianness(offset, 0, 4, littleEndian)),
        b2 = this.getUint8(this.endianness(offset, 1, 4, littleEndian)),
        b1 = this.getUint8(this.endianness(offset, 2, 4, littleEndian)),
        b0 = this.getUint8(this.endianness(offset, 3, 4, littleEndian));
    
        return (b3 * Math.pow(2, 24)) + (b2 &lt;&lt; 16) + (b1 &lt;&lt; 8) + b0;
    
    }
    
};


self.addEventListener('message', function (e) {
    var file = e.data,
        reader = new FileReaderSync(),
        fileData = reader.readAsBinaryString(file),
        dataview = new DataViewShim(fileData);

    if (dataview.getByteAt(0) != 0xFF || dataview.getByteAt(1) != 0xD8) {
        return;
    }
    else {
        offset = 2;
        length = dataview.length;
        
        while (offset &lt; length) {
            marker = dataview.getByteAt(offset+1);
            if (marker == 225) {
                readExifData(dataview, offset + 4, dataview.getShortAt(offset+2, true)-2);
                break;
            }
            else if(marker == 224) {
                offset = 20;
            }
            else {
                offset += 2 + dataview.getShortAt(offset+2, true);
            }
        }
    }
        


    self.postMessage(fileData);
}, false);
*/

self.addEventListener('message', function (e) {
    var file = e.data,
        reader = new FileReaderSync(),
        fileData = reader.readAsDataURL(file);

    self.postMessage(fileData);
}, false);

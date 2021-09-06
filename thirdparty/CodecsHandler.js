/*
The MIT License (MIT)

Copyright (c) 2012-2020 [Muaz Khan](https://github.com/muaz-khan)

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    */
	
// Sourced from: https://cdn.webrtc-experiment.com/CodecsHandler.js

// *FILE HAS BEEN HEAVILY MODIFIED BY STEVE SEGUIN. ALL RIGHTS RESERVED WHERE APPLICABLE *

var CodecsHandler = (function() {
    function preferCodec(sdp, codecName) {
        var info = splitLines(sdp);

        if (!info.videoCodecNumbers) {
            return sdp;
        } else if (codecName === 'vp8' && info.vp8LineNumber === info.videoCodecNumbers[0]) {
            return sdp;
        } else if (codecName === 'vp9' && info.vp9LineNumber === info.videoCodecNumbers[0]) {
            return sdp;
        } else if (codecName === 'h264' && info.h264LineNumber === info.videoCodecNumbers[0]) {
            return sdp;
        } else if (codecName === 'av1' && info.av1LineNumber === info.videoCodecNumbers[0]) {
            return sdp;
		} else if (codecName === 'red' && info.redLineNumber === info.videoCodecNumbers[0]) {
            return sdp;
		} else if (codecName === 'fec' && info.fecLineNumber === info.videoCodecNumbers[0]) {
            return sdp;
        }

        sdp = preferCodecHelper(sdp, codecName, info);

        return sdp;
    }

    function preferCodecHelper(sdp, codec, info, ignore) {
        var preferCodecNumber = '';

        if (codec === 'vp8') {
            if (!info.vp8LineNumber) {
                return sdp;
            }
            preferCodecNumber = info.vp8LineNumber;
			
        } else if (codec === 'vp9') {
            if (!info.vp9LineNumber) {
                return sdp;
            }
            preferCodecNumber = info.vp9LineNumber;
			
        } else if (codec === 'h264') {
            if (!info.h264LineNumber) {
                return sdp;
            }
            preferCodecNumber = info.h264LineNumber;
			
        } else if (codec === 'av1') {
            if (!info.av1LineNumber) {
                return sdp;
            }
            preferCodecNumber = info.av1LineNumber;
			
		} else if (codec === 'red') {
            if (!info.redLineNumber) {
                return sdp;
            }
            preferCodecNumber = info.redLineNumber;
			
		} else if (codec === 'fec') {
            if (!info.fecLineNumber) {
                return sdp;
            }
            preferCodecNumber = info.fecLineNumber;
        }

        var newLine = info.videoCodecNumbersOriginal.split('SAVPF')[0] + 'SAVPF ';

        var newOrder = [preferCodecNumber];

        if (ignore) {
            newOrder = [];
        }

        info.videoCodecNumbers.forEach(function(codecNumber) {
            if (codecNumber === preferCodecNumber) return;
            newOrder.push(codecNumber);
        });

        newLine += newOrder.join(' ');

        sdp = sdp.replace(info.videoCodecNumbersOriginal, newLine);
        return sdp;
    }

    function splitLines(sdp) {
        var info = {};
        sdp.split('\n').forEach(function(line) {
            if (line.indexOf('m=video') === 0) {
                info.videoCodecNumbers = [];
                line.split('SAVPF')[1].split(' ').forEach(function(codecNumber) {
                    codecNumber = codecNumber.trim();
                    if (!codecNumber || !codecNumber.length) return;
                    info.videoCodecNumbers.push(codecNumber);
                    info.videoCodecNumbersOriginal = line;
                });
            }

            if (line.indexOf('VP8/90000') !== -1 && !info.vp8LineNumber) {
                info.vp8LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
            }

            if (line.indexOf('VP9/90000') !== -1 && !info.vp9LineNumber) {
                info.vp9LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
            }

            if (line.indexOf('H264/90000') !== -1 && !info.h264LineNumber) {
                info.h264LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
            }
			
			if (line.indexOf('AV1X/90000') !== -1 && !info.av1LineNumber) {
                info.av1LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
            }
			
			if (line.indexOf('red/90000') !== -1 && !info.redLineNumber) {
                info.redLineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
            }
			
			if (line.indexOf('ulpfec/90000') !== -1 && !info.fecLineNumber) {
                info.fecLineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
            }
        });

        return info;
    }
    
    function extractSdp(sdpLine, pattern) {
        var result = sdpLine.match(pattern);
        return (result && result.length == 2)? result[1]: null;
    }

    function disableNACK(sdp) {
        if (!sdp || typeof sdp !== 'string') {
            throw 'Invalid arguments.';
        }

		sdp = sdp.replace('a=rtcp-fb:35 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:35 nack pli\r\n', 'a=rtcp-fb:35 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:96 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:96 nack pli\r\n', 'a=rtcp-fb:96 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:97 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:97 nack pli\r\n', 'a=rtcp-fb:97 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:98 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:98 nack pli\r\n', 'a=rtcp-fb:98 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:99 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:99 nack pli\r\n', 'a=rtcp-fb:99 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:100 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:100 nack pli\r\n', 'a=rtcp-fb:100 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:102 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:102 nack pli\r\n', 'a=rtcp-fb:102 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:108 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:108 nack pli\r\n', 'a=rtcp-fb:108 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:124 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:124 nack pli\r\n', 'a=rtcp-fb:124 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:123 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:123 nack pli\r\n', 'a=rtcp-fb:123 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:125 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:125 nack pli\r\n', 'a=rtcp-fb:125 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:126 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:126 nack pli\r\n', 'a=rtcp-fb:126 pli\r\n');
		sdp = sdp.replace('a=rtcp-fb:127 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:127 nack pli\r\n', 'a=rtcp-fb:127 pli\r\n');
		
        return sdp;
    }
	
	function disableREMB(sdp) {
        if (!sdp || typeof sdp !== 'string') {
            throw 'Invalid arguments.';
        }
		sdp = sdp.replace('a=rtcp-fb:35 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:96 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:97 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:98 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:99 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:100 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:102 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:108 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:124 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:123 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:125 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:126 goog-remb\r\n', '');
		sdp = sdp.replace('a=rtcp-fb:127 goog-remb\r\n', '');
		
        return sdp;
    }
	
	function disablePLI(sdp) {
        if (!sdp || typeof sdp !== 'string') {
            throw 'Invalid arguments.';
        }
		
		sdp = sdp.replace('a=rtcp-fb:35 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:35 nack pli\r\n', 'a=rtcp-fb:35 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:96 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:96 nack pli\r\n', 'a=rtcp-fb:96 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:97 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:97 nack pli\r\n', 'a=rtcp-fb:97 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:98 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:98 nack pli\r\n', 'a=rtcp-fb:98 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:99 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:99 nack pli\r\n', 'a=rtcp-fb:99 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:100 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:100 nack pli\r\n', 'a=rtcp-fb:100 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:102 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:102 nack pli\r\n', 'a=rtcp-fb:102 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:108 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:108 nack pli\r\n', 'a=rtcp-fb:108 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:124 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:124 nack pli\r\n', 'a=rtcp-fb:124 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:123 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:123 nack pli\r\n', 'a=rtcp-fb:123 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:125 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:125 nack pli\r\n', 'a=rtcp-fb:125 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:126 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:126 nack pli\r\n', 'a=rtcp-fb:126 nack\r\n');
		sdp = sdp.replace('a=rtcp-fb:127 pli\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:127 nack pli\r\n', 'a=rtcp-fb:127 nack\r\n');
		
        return sdp;
    }

  
    // Find the line in sdpLines that starts with |prefix|, and, if specified,
    // contains |substr| (case-insensitive search).
    function findLine(sdpLines, prefix, substr) {
        return findLineInRange(sdpLines, 0, -1, prefix, substr);
    }

    // Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
    // and, if specified, contains |substr| (case-insensitive search).
    function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
        var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
        for (var i = startLine; i < realEndLine; ++i) {
            if (sdpLines[i].indexOf(prefix) === 0) {
                if (!substr ||
                    sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                    return i;
                }
            }
        }
        return null;
    }

    // Gets the codec payload type from an a=rtpmap:X line.
    function getCodecPayloadType(sdpLine) {
        var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
        var result = sdpLine.match(pattern);
        return (result && result.length === 2) ? result[1] : null;
    }

    function getVideoBitrates(sdp) { 

		var defaultBitrate = false;

        var sdpLines = sdp.split('\r\n');
        var mLineIndex = findLine(sdpLines, 'm=', 'video');
        if (mLineIndex === null) {
            return defaultBitrate;
        }
        var videoMLine = sdpLines[mLineIndex];
        var pattern = new RegExp('m=video\\s\\d+\\s[A-Z/]+\\s');
        var sendPayloadType = videoMLine.split(pattern)[1].split(' ')[0];
        var fmtpLine = sdpLines[findLine(sdpLines, 'a=rtpmap', sendPayloadType)];
        var codec = fmtpLine.split('a=rtpmap:' + sendPayloadType)[1].split('/')[0];

        var codecIndex = findLine(sdpLines, 'a=rtpmap', codec+'/90000');
        var codecPayload;
        if (codecIndex) {
            codecPayload = getCodecPayloadType(sdpLines[codecIndex]);
        }

        if (!codecPayload) {
            return defaultBitrate;
        }

        var rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
        var rtxPayload;
        if (rtxIndex) {
            rtxPayload = getCodecPayloadType(sdpLines[rtxIndex]);
        }

        if (!rtxIndex) {
            return defaultBitrate;
        }

        var rtxFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString());
        if (rtxFmtpLineIndex !== null) {
            try {
                var maxBitrate = parseInt(sdpLines[rtxFmtpLineIndex].split("x-google-max-bitrate=")[1].split(";")[0]);
                var minBitrate = parseInt(sdpLines[rtxFmtpLineIndex].split("x-google-min-bitrate=")[1].split(";")[0]);
            } catch(e){
                return defaultBitrate;
            }
           
           if (minBitrate>maxBitrate){
               maxBitrate = minBitrate;
           }
           if (maxBitrate<1){maxBitrate=1;}
           return maxBitrate
        } else {
            return defaultBitrate;
        }

        
        
    }

    function setVideoBitrates(sdp, params, codec) {  // modified + Improved by Steve.
        
        if (codec){
            codec = codec.toUpperCase();
        } else{
            codec="VP8";
        }
        
        var sdpLines = sdp.split('\r\n');

        // Search for m line.
        var mLineIndex = findLine(sdpLines, 'm=', 'video');
        if (mLineIndex === null) {
            return sdp;
        }
        // Figure out the first codec payload type on the m=video SDP line.
        var videoMLine = sdpLines[mLineIndex];
        var pattern = new RegExp('m=video\\s\\d+\\s[A-Z/]+\\s');
        var sendPayloadType = videoMLine.split(pattern)[1].split(' ')[0];
        var fmtpLine = sdpLines[findLine(sdpLines, 'a=rtpmap', sendPayloadType)];
        var codecName = fmtpLine.split('a=rtpmap:' + sendPayloadType)[1].split('/')[0];
		
        codec = codecName || codec; // Try to find first Codec; else use expected/default
        
        params = params || {};
        var min_bitrate = params.min.toString() || '30';
        var max_bitrate = params.max.toString() || '2500';
		

        var codecIndex = findLine(sdpLines, 'a=rtpmap', codec+'/90000');
        var codecPayload;
        if (codecIndex) {
            codecPayload = getCodecPayloadType(sdpLines[codecIndex]);
        }

        if (!codecPayload) {
            return sdp;
        }

        var rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
        var rtxPayload;
        if (rtxIndex) {
            rtxPayload = getCodecPayloadType(sdpLines[rtxIndex]);
        }

        if (!rtxIndex) {
			sdpLines[mLineIndex] += '\r\nb=AS:' + max_bitrate;
			sdp = sdpLines.join('\r\n');
            return sdp;
        } 
		

        var rtxFmtpLineIndexChromium = findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString());
		
        if (rtxFmtpLineIndexChromium !== null){
            var appendrtxNext = '\r\n';
            appendrtxNext += 'a=fmtp:' + codecPayload + ' x-google-min-bitrate=' + min_bitrate + '; x-google-max-bitrate=' + max_bitrate;
            sdpLines[rtxFmtpLineIndexChromium] = sdpLines[rtxFmtpLineIndexChromium].concat(appendrtxNext);
            sdp = sdpLines.join('\r\n');
        }
		
        return sdp;
    }

    function setOpusAttributes(sdp, params) { 
        params = params || {};

        var sdpLines = sdp.split('\r\n');

        var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000');
        var opusPayload;
        if (opusIndex) {
            opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
        }

        if (!opusPayload) {
            return sdp;
        }

        var opusFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
        if (opusFmtpLineIndex === null) {
            return sdp;
        }

        var appendOpusNext = '';
		
		// Please see https://tools.ietf.org/html/rfc7587 for more details on OPUS settings
		
	
		if (typeof params.minptime != 'undefined') {  // max packet size in milliseconds
			if (params.minptime != false) {
				appendOpusNext += ';minptime:' + params.minptime; // 3, 5, 10, 20, 40, 60 and the default is 120. (20 is minimum recommended for webrtc)
			}
        }
		
		if (typeof params.maxptime != 'undefined') {  // max packet size in milliseconds
			if (params.maxptime != false) {
				appendOpusNext += ';maxptime:' + params.maxptime; // 3, 5, 10, 20, 40, 60 and the default is 120. (20 is minimum recommended for webrtc)
			}
        }
		
		if (typeof params.ptime != 'undefined') {  // packet size; webrtc doesn't support less than 10 or 20 I think.
			if (params.ptime != false) {
				appendOpusNext += ';ptime:' + params.ptime; 
			}
        }
		
		if (typeof params.stereo != 'undefined'){
			if (params.stereo==0){
				appendOpusNext += ';stereo=0;sprop-stereo=0';  // defaults to 0
			} else if (params.stereo==1){
				appendOpusNext += ';stereo=1;sprop-stereo=1'; // defaults to 0
			} else if (params.stereo==2){
				sdpLines[opusIndex] = sdpLines[opusIndex].replace("opus/48000/2", "multiopus/48000/6");
				appendOpusNext += ';channel_mapping=0,4,1,2,3,5;num_streams=4;coupled_streams=2';  // Multi-channel 5.1 audio
			}
		}
		
        if (typeof params.maxaveragebitrate != 'undefined') {
			if (sdpLines[opusFmtpLineIndex].split("maxaveragebitrate=").length==1){
				appendOpusNext += ';maxaveragebitrate=' + params.maxaveragebitrate; // default 32000? (kbps)
			}
        }

        if (typeof params.maxplaybackrate != 'undefined') {
			if (sdpLines[opusFmtpLineIndex].split("maxplaybackrate=").length==1){
				appendOpusNext += ';maxplaybackrate=' + params.maxplaybackrate; // Default should be 48000 (hz) , 8000 to 48000 are valid options
			}
        }

        if (typeof params.cbr != 'undefined') {
			if (sdpLines[opusFmtpLineIndex].split("cbr=").length==1){
				appendOpusNext += ';cbr=' + params.cbr; // default is 0 (vbr)
			}
        }

        if (typeof params.useinbandfec != 'undefined') {  // useful for handling packet loss
			if (sdpLines[opusFmtpLineIndex].split("useinbandfec=").length==1){
				appendOpusNext += ';useinbandfec=' + params.useinbandfec;  // Defaults to 0
			}
        }

        if (typeof params.usedtx != 'undefined') {  // Default is 0
			if (sdpLines[opusFmtpLineIndex].split("usedtx=").length==1){
				appendOpusNext += ';usedtx=' + params.usedtx; // if decoder prefers the use of DTX.
			}
        }

        

        sdpLines[opusFmtpLineIndex] = sdpLines[opusFmtpLineIndex].concat(appendOpusNext);

        sdp = sdpLines.join('\r\n');
		
        return sdp;
    }
	
	
	function getOpusBitrate(sdp) { 

        var sdpLines = sdp.split('\r\n');

        var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000');
        var opusPayload;
        if (opusIndex) {
            opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
        }

        if (!opusPayload) {
            return 0;
        }

        var opusFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
        if (opusFmtpLineIndex === null) {
            return 0;
        }

        var appendOpusNext = '';
		
        if (sdpLines[opusFmtpLineIndex].split("maxaveragebitrate=").length>1){
			var tmp = sdpLines[opusFmtpLineIndex].split("maxaveragebitrate=")[1];
			tmp = tmp.split('\r')[0];
			tmp = tmp.split('\n')[0];
			tmp = tmp.split(';')[0];
			tmp = parseInt(tmp);
			return tmp;
		}
        return 32768;
    }

	
    return {
        disableNACK: disableNACK,
		
		disablePLI: disablePLI,
		
		disableREMB: disableREMB,
        
		getVideoBitrates: function(sdp) {
            return getVideoBitrates(sdp);
        },
		
        setVideoBitrates: function(sdp, params, codec) {
            return setVideoBitrates(sdp, params, codec);
        },
        setOpusAttributes: function(sdp, params) {
            return setOpusAttributes(sdp, params);
        },
		
		getOpusBitrate: function(sdp){
			return getOpusBitrate(sdp);
		},

        preferCodec: preferCodec
    };
})();


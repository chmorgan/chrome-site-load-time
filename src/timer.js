/*

Copyright (C) 2017  Chris Morgan <chmorgan@gmail.com>

The JavaScript code in this page is free software: you can
redistribute it and/or modify it under the terms of the GNU
General Public License (GNU GPL) as published by the Free Software
Foundation, either version 3 of the License, or (at your option)
any later version.  The code is distributed WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

As additional permission under GNU GPL version 3 section 7, you
may distribute non-source (e.g., minimized or compacted) forms of
that code without the copy of the GNU GPL normally required by
section 4, provided you include this license notice and a URL
through which recipients can access the Corresponding Source.

*/

(function() {
    if (document.readyState == "complete") {
        // synthesize an event so we can use measure() int both "complete" and "load" cases
        var event = { 'srcElement' : { 'URL' : document.URL }};
        measure(event);
    } else {
        window.addEventListener("load", measure);
    }

    function measure(event) {
        setTimeout(function() {
            var url = event.srcElement.URL;
            // see http://w3c.github.io/navigation-timing/#processing-model
            var t = performance.timing;
            var start = t.redirectStart == 0 ? t.fetchStart : t.redirectStart;

            if (t.loadEventEnd > 0) {
                // we have only 4 chars in our disposal including decimal point
                var time = String(((t.loadEventEnd - start) / 1000).toPrecision(3)).substring(0, 4);

                // since Chrome 43 JSON.stringify() doesn't work for PerformanceTiming
                // https://code.google.com/p/chromium/issues/detail?id=467366
                // need to manually copy properties via for .. in loop
                var timing = {};
                for (var p in t) {
                    if (typeof(t[p]) !== "function") {
                        timing[p] = t[p];
                    }
                }

                chrome.runtime.sendMessage({url: url, time: time, timing: timing});
            }
        }, 0);
    }
})();

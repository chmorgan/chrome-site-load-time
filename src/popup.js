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

document.addEventListener('DOMContentLoaded', function () {
    var btnreset = document.getElementById("btnreset");
    btnreset.addEventListener('click', resetStats);
});

function resetStats() {
    chrome.storage.local.clear();

    removeEntries();
}

chrome.tabs.getSelected(null, function (tab) {
    addEntries();
});

function getTimingSum(timing_entries) {
    var total_sum = 0;
    for(var i = 0; i < timing_entries.length; i++)
    {
        var timing_entry = timing_entries[i];
        var t = timing_entry.timing;
        var start = t.redirectStart == 0 ? t.fetchStart : t.redirectStart;
        var total = t.loadEventEnd - start;

        total_sum += total;
    }

    return total_sum;
}

function addEntries() {
    chrome.storage.local.get('cache', function(data) {
        // build the html from the site data
        var timing_table = document.getElementById('timing_table');

        // convert entries into an array and sort them
        var sortable = [];
        for (var entry in data.cache) {
            sortable.push([entry, data.cache[entry]]);
        }

        sortable.sort(function(a, b) {
            var a_sum = getTimingSum(a[1]);
            var b_sum = getTimingSum(b[1]);
            return (a_sum > b_sum) ? 1 : ((b_sum > a_sum) ? -1 : 0);
        });

        sortable.reverse();

        for(var i = 0; i < sortable.length; i++)
        {
            var entry = sortable[i];

            var row = timing_table.insertRow(-1);
            if((i % 2) == 0)
            {
                row.classList.add('even');
            } else
            {
                row.classList.add('odd');
            }

            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);

            var host = entry[0];
            var host_entry = entry[1];

            timing_sum = getTimingSum(host_entry);

            // Add some text to the new cells:
            cell1.innerHTML = "<div class='host' title='" + host + "'>" + host + "</div>";
            cell2.innerHTML = timing_sum;
            cell3.innerHTML = host_entry.length;
        }
    });
}

/* Remove all of the entry rows in the table */
function removeEntries() {
    var timing_table = document.getElementById('timing_table');
    var row_count = timing_table.rows.length;

    for(var i = 0; i < row_count; i++)
    {
        timing_table.deleteRow(-1);
    }
}

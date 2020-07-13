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

/* Record the list elements we updated the screen with so we can
   minmize refreshes */
var last_entries = [];

document.addEventListener('DOMContentLoaded', function () {
    var btnreset = document.getElementById("btnreset");
    btnreset.addEventListener('click', resetStats);

    var btnexportcsv = document.getElementById("btnexportcsv");
    btnexportcsv.addEventListener('click', exportCSV);
});

function resetStats() {
    chrome.storage.local.clear();

    removeEntries();
}

function exportCSV() {
    getFilteredEntries().then(function(filteredEntries)
    {
        var outputCSV = 'unixtime,host,url,duration_ms\n';

        for(var entry in filteredEntries)
        {
            var host_entry = filteredEntries[entry];
            var timing_array = host_entry[1];

            for(var i = 0; i < timing_array.length; i++)
            {
                var timing_entry = timing_array[i];
                var duration = getElapsedTime(timing_entry);

                outputCSV = outputCSV + '\"' + timing_entry.timing.loadEventEnd + '\",' + host_entry[0] + '\",' + timing_entry.url + ',' + duration + '\n';
            }
        }

        var link = document.createElement('a');
        link.setAttribute('href', 'data:text/plain;base64,' + window.btoa(outputCSV));
        link.setAttribute('download', 'timing_export.csv');
        link.click();
    });
}

chrome.tabs.getSelected(null, function (tab) {
    getFilteredEntries().then(function(filteredEntries)
    {
        addEntries(filteredEntries);
        last_entries = filterEntries;
    });
});

function getElapsedTime(timing_entry)
{
    var t = timing_entry.timing;
    var start = t.redirectStart == 0 ? t.fetchStart : t.redirectStart;
    var total = t.loadEventEnd - start;

    return total;
}

function getTimingSum(timing_entries) {
    var total_sum = 0;
    for(var i = 0; i < timing_entries.length; i++)
    {
        var timing_entry = timing_entries[i];
        var total = getElapsedTime(timing_entry);
        total_sum += total;
    }

    return total_sum;
}

function sortEntries(entriesObject)
{
    // convert entries into an array and sort them
    var sortable = [];
    for (var entry in entriesObject) {
        sortable.push([entry, entriesObject[entry]]);
    }

    sortable.sort(function(a, b) {
        var a_sum = getTimingSum(a[1]);
        var b_sum = getTimingSum(b[1]);
        return (a_sum > b_sum) ? 1 : ((b_sum > a_sum) ? -1 : 0);
    });

    sortable.reverse();

    return sortable;
}

/**
 * Filter with regex
 * @param {array} of entries
 * @param {string} regex
 * @returns {array} of filtered entries
 */
function filterEntries(entriesArray, regex)
{
    var filteredEntries = [];

    for(var i = 0; i < entriesArray.length; i++)
    {
        var entry = entriesArray[i];
        var host = entry[0];

        if(!regex || host.match(regex))
        {
            filteredEntries.push(entry);
        }
    }

    return filteredEntries;
}

function addEntries(filteredEntries) {
    // build the html from the site data
    var timing_table = document.getElementById('timing_table');

    for(var i = 0; i < filteredEntries.length; i++)
    {
        var entry = filteredEntries[i];

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

/**
 * @return A promise that is an array of entries filtered by regex
 */
function getFilteredEntries()
{
    var deferred = $.Deferred();

    chrome.storage.local.get('cache', function(data) {
        var regex = $("#filter_text").val();
        var sortedEntries = sortEntries(data.cache);
        var filteredEntries = filterEntries(sortedEntries, regex);

        deferred.resolve(filteredEntries);
    });

    return deferred.promise();
}

$(document).ready(function() {
    /* Update the entries table when the filter text changes */
    $("#filter_text").on("change keyup", function() {
        getFilteredEntries().then(function(filteredEntries)
        {
            // compare the filteredEntries with the last_entries array
            var mismatch = false;
            if(filteredEntries.length === last_entries.length)
            {
                for(var i = 0; i < filteredEntries.length; i++)
                {
                    if(JSON.stringify(filteredEntries[i]) !== JSON.stringify(last_entries[i]))
                    {
                        mismatch = true;
                    }
                }
            } else
            {
                mismatch = true;
            }

            if(mismatch)
            {
                // Naive approach to avoid flickering
                //
                // Better ideas include removing/adding only changes between
                // refreshes.
                $("#main_table").hide();
                removeEntries();
                addEntries(filteredEntries);
                $("#main_table").show();

                var filter_text = $("#filter_text").val();

                if(filter_text)
                {
                    $("#cancel_img").removeClass("disabled");
                } else
                {
                    $("#cancel_img").addClass("disabled");
                }

                last_entries = filteredEntries;
            }
        });
    });

    /* Clear the filter text when the cancel button is clicked */
    $("#cancel_img").click(function(){
        if($("#filter_text").val())
        {
            $("#filter_text").val("");

            /* Force a change event as changing the value programmatically doesn't */
            $("#filter_text").trigger("change");
        }
    });
});

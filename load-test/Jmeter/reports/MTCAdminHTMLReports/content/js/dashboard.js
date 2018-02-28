/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5694444444444444, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.16666666666666666, 500, 1500, "Admin Sign In"], "isController": false}, {"data": [0.0, 500, 1500, "Restart - Select Pupil Page"], "isController": false}, {"data": [1.0, 500, 1500, "Edit Group - Update Pupil"], "isController": false}, {"data": [0.0, 500, 1500, "Pupil Register"], "isController": false}, {"data": [1.0, 500, 1500, "Add Reason - Pupil Not Taking Check"], "isController": false}, {"data": [0.16666666666666666, 500, 1500, "Restart - Landing Page"], "isController": false}, {"data": [0.5, 500, 1500, "Edit Group - Landing Page"], "isController": false}, {"data": [1.0, 500, 1500, "Groups - Landing Page"], "isController": false}, {"data": [1.0, 500, 1500, "Pupil Not Taking Check Landing"], "isController": false}, {"data": [1.0, 500, 1500, "Generate Pin - Landing Page"], "isController": false}, {"data": [0.0, 500, 1500, "Generate Pin - Pupil List Page"], "isController": false}, {"data": [1.0, 500, 1500, "Add Group"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 36, 0, 0.0, 1496.8055555555552, 105, 6467, 4357.800000000001, 6420.25, 6467.0, 1.6164518881056082, 88.47579075647702, 0.5771852268645323], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Admin Sign In", 3, 0, 0.0, 1703.3333333333333, 1485, 1829, 1829.0, 1829.0, 1829.0, 1.6402405686167303, 2.5521972389283762, 0.41326373701476216], "isController": false}, {"data": ["Restart - Select Pupil Page", 3, 0, 0.0, 2418.3333333333335, 1767, 3431, 3431.0, 3431.0, 3431.0, 0.5523844595838704, 8.364704646934266, 0.15176187626588106], "isController": false}, {"data": ["Edit Group - Update Pupil", 3, 0, 0.0, 300.0, 271, 352, 352.0, 352.0, 352.0, 0.4125979920231055, 15.806183167721084, 0.2688871028744327], "isController": false}, {"data": ["Pupil Register", 3, 0, 0.0, 4963.333333333333, 4124, 6467, 6467.0, 6467.0, 6467.0, 0.463893613731251, 97.80922012718418, 0.128355980361837], "isController": false}, {"data": ["Add Reason - Pupil Not Taking Check", 3, 0, 0.0, 330.6666666666667, 257, 467, 467.0, 467.0, 467.0, 0.9179926560587516, 11.332965976897185, 0.7150899824051408], "isController": false}, {"data": ["Restart - Landing Page", 3, 0, 0.0, 1596.0, 1247, 2040, 2040.0, 2040.0, 2040.0, 0.5952380952380953, 5.918860057043651, 0.15656001984126983], "isController": false}, {"data": ["Edit Group - Landing Page", 3, 0, 0.0, 588.6666666666666, 526, 704, 704.0, 704.0, 704.0, 0.4596996628869139, 40.56101315890285, 0.12809339564817654], "isController": false}, {"data": ["Groups - Landing Page", 3, 0, 0.0, 158.0, 136, 189, 189.0, 189.0, 189.0, 0.9566326530612245, 34.511644013073976, 0.2544169523278061], "isController": false}, {"data": ["Pupil Not Taking Check Landing", 3, 0, 0.0, 336.0, 325, 348, 348.0, 348.0, 348.0, 1.2903225806451613, 13.60425067204301, 0.35702284946236557], "isController": false}, {"data": ["Generate Pin - Landing Page", 3, 0, 0.0, 192.0, 105, 338, 338.0, 338.0, 338.0, 0.8987417615338525, 8.757758669113242, 0.2504306470940683], "isController": false}, {"data": ["Generate Pin - Pupil List Page", 3, 0, 0.0, 5018.333333333333, 4148, 6412, 6412.0, 6412.0, 6412.0, 0.2881290818286592, 64.11397305993084, 0.08309972867844793], "isController": false}, {"data": ["Add Group", 3, 0, 0.0, 357.0, 186, 480, 480.0, 480.0, 480.0, 0.9416195856873822, 1.4669893675455117, 0.3760961040489642], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 36, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

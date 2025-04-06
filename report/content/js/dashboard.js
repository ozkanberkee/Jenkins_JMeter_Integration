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
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
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

    var data = {"OkPercent": 58.86654478976234, "KoPercent": 41.13345521023766};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4351005484460695, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4197080291970803, 500, 1500, "T02_Load"], "isController": false}, {"data": [0.46099290780141844, 500, 1500, "T01_Launch"], "isController": false}, {"data": [0.43703703703703706, 500, 1500, "T03_Search"], "isController": false}, {"data": [0.4216417910447761, 500, 1500, "T04_Checkout"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 547, 225, 41.13345521023766, 513.0530164533822, 12, 1001, 515.0, 902.0, 957.4000000000001, 995.0, 17.850150110951574, 2.316738696808511, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["T02_Load", 137, 61, 44.52554744525548, 506.5036496350365, 12, 995, 485.0, 892.0, 959.1, 995.0, 4.593769909130537, 0.5961605765684204, 0.0], "isController": false}, {"data": ["T01_Launch", 141, 52, 36.87943262411348, 520.269503546099, 22, 1000, 547.0, 908.4, 969.4000000000001, 1000.0, 4.601226993865031, 0.5971741511388853, 0.0], "isController": false}, {"data": ["T03_Search", 135, 54, 40.0, 521.4666666666668, 12, 1000, 541.0, 896.0, 942.2, 995.3199999999998, 4.6226544308998765, 0.599968647274346, 0.0], "isController": false}, {"data": ["T04_Checkout", 134, 58, 43.28358208955224, 503.67910447761204, 14, 1001, 510.0, 915.5, 967.25, 998.5500000000001, 4.669965846518436, 0.6061739279117586, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["401/OK", 23, 10.222222222222221, 4.204753199268739], "isController": false}, {"data": ["402/OK", 21, 9.333333333333334, 3.8391224862888484], "isController": false}, {"data": ["502/OK", 27, 12.0, 4.936014625228519], "isController": false}, {"data": ["501/OK", 15, 6.666666666666667, 2.742230347349177], "isController": false}, {"data": ["404/OK", 28, 12.444444444444445, 5.118829981718465], "isController": false}, {"data": ["405/OK", 25, 11.11111111111111, 4.570383912248629], "isController": false}, {"data": ["403/OK", 23, 10.222222222222221, 4.204753199268739], "isController": false}, {"data": ["503/OK", 23, 10.222222222222221, 4.204753199268739], "isController": false}, {"data": ["504/OK", 22, 9.777777777777779, 4.021937842778794], "isController": false}, {"data": ["505/OK", 18, 8.0, 3.290676416819013], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 547, 225, "404/OK", 28, "502/OK", 27, "405/OK", 25, "401/OK", 23, "403/OK", 23], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["T02_Load", 137, 61, "502/OK", 10, "404/OK", 7, "405/OK", 7, "403/OK", 7, "401/OK", 6], "isController": false}, {"data": ["T01_Launch", 141, 52, "404/OK", 11, "502/OK", 7, "504/OK", 6, "401/OK", 5, "402/OK", 5], "isController": false}, {"data": ["T03_Search", 135, 54, "503/OK", 8, "405/OK", 7, "403/OK", 7, "401/OK", 6, "505/OK", 6], "isController": false}, {"data": ["T04_Checkout", 134, 58, "403/OK", 9, "402/OK", 8, "504/OK", 8, "401/OK", 6, "405/OK", 6], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

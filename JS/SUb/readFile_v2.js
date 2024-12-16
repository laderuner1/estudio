var lines;
var Array_date = [0];
var orderArrayHeader = ['RENGLON','ORIGEN COMPROBANTE','TIP0 COMPROBANTE','NÚMERO FACTURA',
                        'CUIT','FECHA','IMPORTE','ALICUOTA','MONTO RETENIDO','REGIMEN DE RETENCION',
                        'JURIDICCIÓN','OPERACIÓN','FECHA CONSTANCIA','NUM CONSTANCIA','ORIGINAL CONTANCIA'];
var f = new Date();
var v_sysdate = f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear();
var total = 0;

/****************************************************************************************************/
/****************************************************************************************************/
function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}
/****************************************************************************************************/
/****************************************************************************************************/
function createTable(tableData) {

  var textfield = document.createElement("input");
      textfield.type = "text";
      textfield.value = "";
      textfield.name = "monto";
  
  var div = document.createElement("div");
  div.innerHTML = financial(total);
  /*var input = document.createElement("input");
      input.setAttribute('type', 'text');*/

  var table = document.createElement('table');
  var tableBody = document.createElement('tbody');
  var thead = document.createElement('thead');

  table.appendChild(thead);

  for(var i=0;i<orderArrayHeader.length;i++){
        thead.appendChild(document.createElement("th")).
        appendChild(document.createTextNode(orderArrayHeader[i]));
    }

  tableData.forEach(function(rowData) {
    var row = document.createElement('tr');

    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      /*if(cellData == 'MONTO' || cellData == 'FECHA'){
        cell.appendChild(document.createElement("input"));  
      }else{
        cell.appendChild(document.createTextNode(cellData));
      }*/
      
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  //document.body.appendChild(table);
  document.getElementById("main").appendChild(table);
  document.getElementById("TOTAL_ID").appendChild(div);
}
/****************************************************************************************************/
/****************************************************************************************************/
function fillArray(){

  //----
  

  var parser = new DOMParser();
  var doc = parser.parseFromString('<input type="text" name="monto">', 'text/html');
  var importe = 0;
  var tipo_factura;
  var neto_gravado = 0;
  var neto = 0;
  var fecha;
  var iibb = 0;
  var num_factura;

  total = 0;
  for (var i = 0; i < lines.length; i++) {

  tipo_factura = lines[i].substring(09,11); 
  fecha        = lines[i].substring(1,9,2).substring(6,8) + '/' + lines[i].substring(1,9,2).substring(4,6) + '/' + lines[i].substring(1,9,2).substring(0,4);  
  importe      = Number(lines[i].substring(138,198).substring(1,lines[i].substring(138,198).length-2) + '.' + lines[i].substring(138,198).substring(lines[i].substring(138,198).length-2,lines[i].substring(138,198).length));  
  neto_gravado = Number(lines[i].substring(98,121) + '.' + lines[i].substring(121,123));
  neto         = Number(lines[i].substring(123,136) + '.' + lines[i].substring(136,138));
  num_factura  = zfill(Number(lines[i].substring(16,24)),14) // fill 14 zeros  ---lines[i].substring(16,24); 

  /*if (tipo_factura == '01') {
    iibb = neto_gravado * 0.004;
  }else{
    iibb = (neto_gravado + neto) * 0.004;
  }*/

 /* switch(tipo_factura){
    case '01': iibb = neto_gravado * 0.004; break;
    case '06': iibb = (neto_gravado + neto) * 0.004; break;
  }*/
  iibb = getIIBBdata(i);
  /*iibb = lines[i].substring(139,244);
  iibb = iibb.replaceAll('0','');
  iibb = iibb.substring(iibb.length,2);*/

  Array_date[i] = [   '00' + (i+1),
                      '1', 
                      '1', //tipo de factura ---lines[i].substring(10,11),
                      '0',//lines[i].substring(16,24),
                      lines[i].substring(37,48),
                      fecha,
                      financial(iibb),//Importe,
                      '3',
                      financial(iibb),///financial((3/100) * iibb),//htmlDecode(textfield.outerHTML.replace(/</g, '&lt;').replace(/>/g, '&gt;')),
                      '11',
                      '904',
                      '1',
                      fecha,
                      num_factura,
                      '00000000000000']
   /*if(i != Array_date.length){
     total = total + ((3/100) * iibb);
   }*/                   
   
}

  Array_date.splice(Array_date.length-1);

    for (var i = 0; i < Array_date.length; i++) {
  total = total + Number(Array_date[i][8]);
}

  createTable(Array_date);
}

document.getElementById('file').onchange = function(){

  var file = this.files[0];

  var reader = new FileReader();
  reader.onload = function(progressEvent){
    // Entire file
    console.log(this.result);

    // By lines
    lines = this.result.split('\n');
    for(var line = 0; line < lines.length; line++){
      console.log(lines[line]);
    }
  };
  reader.readAsText(file);
  
  
};
/****************************************************************************************************/
/****************************************************************************************************/
function download_csv(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV FILE
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // We have to create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Make sure that the link is not displayed
    downloadLink.style.display = "none";

    // Add the link to your DOM
    document.body.appendChild(downloadLink);

    // Lanzamos
    downloadLink.click();
}
/****************************************************************************************************/
/****************************************************************************************************/
function export_table_to_csv(html, filename) {
    var csv = [];
    var rows = document.querySelectorAll("table tr");
    
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");
        
        for (var j = 0; j < cols.length; j++) 
            row.push(cols[j].innerText);
        
        csv.push(row.join(","));        
    }

    // Download CSV
    download_csv(csv.join("\n"), filename);
}
/****************************************************************************************************/
/****************************************************************************************************/
function downloadFileCSV () {
    var html = document.querySelector("table").outerHTML;
    export_table_to_csv(html, "table.csv");
};
/****************************************************************************************************/
/****************************************************************************************************/
function financial(x) {
  return Number.parseFloat(x).toFixed(2);
}
/****************************************************************************************************/
/****************************************************************************************************/
function zfill(number, width) {
    var numberOutput = Math.abs(number); /* Valor absoluto del número */
    var length = number.toString().length; /* Largo del número */ 
    var zero = "0"; /* String de cero */  
    
    if (width <= length) {
        if (number < 0) {
             return ("-" + numberOutput.toString()); 
        } else {
             return numberOutput.toString(); 
        }
    } else {
        if (number < 0) {
            return ("-" + (zero.repeat(width - length)) + numberOutput.toString()); 
        } else {
            return ((zero.repeat(width - length)) + numberOutput.toString()); 
        }
    }
}
/****************************************************************************************************/
/****************************************************************************************************/
function getIIBBdata(i){
//for (var i = 0; i < 48; i++) {
  var num = lines[i].substring(139,244).replace(/^0+/, '')/Number('1e+' + (lines[i].substring(139,244).replace(/^0+/, '').length-2));
  //console.log(Number(num));
  return financial(num);
//}
}
/****************************************************************************************************/
/****************************************************************************************************/
/*$(function(){
  $("td").click(function(event){
    if($(this).children("input").length > 0)
          return false;

    var tdObj = $(this);
    var preText = tdObj.html();
    var inputObj = $("<input type='text' />");
    tdObj.html("");

    inputObj.width(tdObj.width())
            .height(tdObj.height())
            .css({border:"0px",fontSize:"17px"})
            .val(preText)
            .appendTo(tdObj)
            .trigger("focus")
            .trigger("select");

    inputObj.keyup(function(event){
      if(13 == event.which) { // press ENTER-key
        var text = $(this).val();
        tdObj.html(text);
      }
      else if(27 == event.which) {  // press ESC-key
        tdObj.html(preText);
      }
    });

    inputObj.click(function(){
      return false;
    });
  });
});*/
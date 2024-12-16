var lines;
var Array_date = [0];
var allText = '';
/*var orderArrayHeader = ['RENGLON','ORIGEN COMPROBANTE','TIP0 COMPROBANTE','NÚMERO FACTURA',
                        'CUIT','FECHA','IMPORTE','ALICUOTA','MONTO RETENIDO','REGIMEN DE RETENCION',
                        'JURIDICCIÓN','OPERACIÓN','FECHA CONSTANCIA','NUM CONSTANCIA','ORIGINAL CONTANCIA'];*/
var orderArrayHeader = ['REMOVER'
  ,'RENGLON'
  , 'TIP0 COMPROBANTE'
  , 'FACTURA'
  , 'NÚMERO FACTURA'
  , 'CUIT'
  , 'FECHA'
  , 'MONTO SUJETO A PERC'
  , 'ALICUOTA'
  , 'MONTO RETENIDO'
  , 'REGIMEN DE RETENCION'
  , 'JURIDICCIÓN'
  , 'OPERACIÓN'
  //,'FECHA CONSTANCIA'
  //,'NUM CONSTANCIA'
  , 'ORIGINAL CONTANCIA'
];
var f = new Date();
var v_sysdate = f.getDate() + "_" + (f.getMonth() + 1) + "_" + f.getFullYear();
var total = 0;
var periodo;
var checkbox
/****************************************************************************************************/
/****************************************************************************************************/
function htmlDecode(input) {
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

  var div     = document.createElement("div");
  var divRows = document.createElement("div");

  div.innerHTML = financial(total);
  

  var table = document.createElement('table');
  var tableBody = document.createElement('tbody');
  var thead = document.createElement('thead');

  table.appendChild(thead);

  // Crear encabezados de la tabla
  for (var i = 0; i < orderArrayHeader.length; i++) {
      thead.appendChild(document.createElement("th")).
      appendChild(document.createTextNode(orderArrayHeader[i]));
  }

  // Crear filas de la tabla
  tableData.forEach(function (rowData, v) {
      var row = document.createElement('tr');

      // Crear la primera celda con el checkbox
      var checkboxCell = document.createElement('td');
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("remove-checkbox");
      checkboxCell.appendChild(checkbox);
      row.appendChild(checkboxCell);

      // Crear las demás celdas con los datos de la fila
      rowData.forEach(function (cellData, index) {
          var cell = document.createElement('td');
          cell.appendChild(document.createTextNode(cellData));
          row.appendChild(cell);
      });

      tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  document.getElementById("main").appendChild(table);
  document.getElementById("TOTAL_ID").appendChild(div);

  divRows.innerHTML = $('table tbody tr').length;
  document.getElementById("NUM_ROWS").appendChild(divRows);
  //document.getElementById("TOTAL_PERC").appendChild(div);
}

/****************************************************************************************************/
/****************************************************************************************************/
function fillArray() {

  //----


  var parser = new DOMParser();
  var doc = parser.parseFromString('<input type="text" name="monto">', 'text/html');
  var importe = 0;
  var tipo_factura;
  var neto_gravado = 0;
  var neto = 0;
  var fecha;
  var iibb = 0;
  var raw_iibbb;
  var iibb_calc;
  var num_factura;
  var letra;
  var tipo_factura_num;
  var excento;
  var z = 0;
  var is_perceptions;
  var count_rows = 0;
  

  total = 0;
  for (var i = 0; i < lines.length; i++) {

    tipo_factura = lines[i].substring(9, 11);
    fecha = lines[i].substring(1, 9, 2).substring(6, 8) + '/' + lines[i].substring(1, 9, 2).substring(4, 6) + '/' + lines[i].substring(1, 9, 2).substring(0, 4);
    importe = Number(lines[i].substring(138, 198).substring(1, lines[i].substring(138, 198).length - 2) + '.' + lines[i].substring(138, 198).substring(lines[i].substring(138, 198).length - 2, lines[i].substring(138, 198).length));
    neto_gravado = Number(lines[i].substring(98, 121) + '.' + lines[i].substring(121, 123));
    neto = Number(lines[i].substring(123, 136) + '.' + lines[i].substring(136, 138));
    num_factura = zfill(Number(lines[i].substring(16, 24)), 12) // fill 12 zeros  ---lines[i].substring(16,24); 
    excento = lines[i].substring(243, 245); // if 05 then excento
    
    /*if (tipo_factura == '01') {
      iibb = neto_gravado * 0.004;
    }else{
      iibb = (neto_gravado + neto) * 0.004;
    }*/

    switch (tipo_factura) {
      case '01': letra = 'A'; break;
      case '06': letra = 'B'; break;
      case '08': letra = 'B'; break; //NOTAS DE CREDITO B
      case '03': letra = 'A'; break; //NOTAS DE CREDITO A
      case '02': letra = 'A'; break; //NOTAS DE DEBITO A
      case '07': letra = 'B'; break; //NOTAS DE DEBITO B
    }
    switch (tipo_factura) {
      case '01': tipo_factura_num = '1'; break;
      case '06': tipo_factura_num = '1'; break;
      case '08': tipo_factura_num = '102'; break; //NOTAS DE CREDITO B
      case '03': tipo_factura_num = '102'; break; //NOTAS DE CREDITO A 
      case '02': tipo_factura_num = '2'; break;//NOTAS DE DEBITO A
      case '07': tipo_factura_num = '2'; break;//NOTAS DE DEBITO B
    }

    //iibb = getIIBBdata(i);
    iibb = 0;
    if (Number(lines[i].substring(139, 153).replace(/^0+/, '')) != 0) {

      raw_iibbb = lines[i].substring(139, 153).replace(/^0+/, '');
      iibb = raw_iibbb.substring(0, raw_iibbb.length - 2) + '.' + raw_iibbb.substring(raw_iibbb.length - 2, raw_iibbb.length);

    } else if (Number(lines[i].substring(184, 198).replace(/^0+/, '')) != 0) {

      raw_iibbb = lines[i].substring(184, 198).replace(/^0+/, '');
      iibb = raw_iibbb.substring(0, raw_iibbb.length - 2) + '.' + raw_iibbb.substring(raw_iibbb.length - 2, raw_iibbb.length);
    } else if (Number(lines[i].substring(169, 183).replace(/^0+/, '')) != 0) {

      raw_iibbb = lines[i].substring(169, 183).replace(/^0+/, '');
      iibb = raw_iibbb.substring(0, raw_iibbb.length - 2) + '.' + raw_iibbb.substring(raw_iibbb.length - 2, raw_iibbb.length);
    }



    is_perceptions = Number(lines[i].substring(139, 244));

    if (is_perceptions == 0) {
      excento = '05';
    }

    //if (excento != '05' /*|| lines[i].substring(0, 1) != '2'*/)  {

      iibb_calc = (0.4 / 100) * neto_gravado;

      /**/
      count_rows = i + 1;
      /**/
          checkbox = document.createElement("input");
          checkbox.setAttribute("type", "checkbox");
          checkbox.classList.add("remove-checkbox");

      /** */

      Array_date[z] = [
        //,checkbox//document.body.appendChild(checkbox)
         '00' + (z + 1)                            //Número de Renglon
        , tipo_factura_num                             //Tipo de Comprobante
        , letra                                        //Letra
        , num_factura                                  //Numero de Comprobante
        , lines[i].substring(37, 48)                    //CUIT
        , fecha                                        //Fecha de Percepción
        , financial(neto_gravado)                      //Monto Sujeto a Pecepción,
        , '0.4'                                        //Alicuota
        //,financial(iibb)                            //Monto Percibido mapeado
        , financial(iibb_calc)                         //Monto Percibido calculado
        , '11'                                         //Tipo de Regimen
        , '904'                                        //Juridicción
        , '1'                                          //Tipo de Operacion
        , '1'                                          //Num de Constancia Original
      ]
      z++;
    //} //Fin Excentos                   
    /*if(i != Array_date.length){
      total = total + ((3/100) * iibb);
    }*/

  }
  //document.body.appendChild(checkbox);
  //Array_date.splice(Array_date.length - 1);

  for (var x = 0; x < Array_date.length; x++) {
    total = total + Number(Array_date[x][8]);
  }

  createTable(Array_date);
}
/****************************************************************************************************/
/****************************************************************************************************/
/*document.getElementById('file').onchange = function () {

  var file = this.files[0];

  var reader = new FileReader();
  reader.onload = function (progressEvent) {
    // Entire file
    console.log(this.result);

    // By lines
    lines = this.result.split('\n');
    for (var line = 0; line < lines.length; line++) {
      console.log(lines[line]);
    }
  };
  reader.readAsText(file);


};*/
/*New Funciton to Upload Multiple Files*/
/****************************************************************************************************/
/****************************************************************************************************/
function readFileAsText(file){
  return new Promise(function(resolve,reject){
      let fr = new FileReader();

      fr.onload = function(){
          resolve(fr.result);
      };

      fr.onerror = function(){
          reject(fr);
      };

      fr.readAsText(file);
  });
}
/** Process Multiple Files */
/****************************************************************************************************/
/****************************************************************************************************/
document.getElementById("file").addEventListener("change", function(ev){
  let files = ev.currentTarget.files;
  let readers = [];
  var arrVar = [0];
  // Abort if there were no files selected
  if(!files.length) return;

  // Store promises in array
  for(let i = 0;i < files.length;i++){
      readers.push(readFileAsText(files[i]));
  }
  
  // Trigger Promises
  Promise.all(readers).then((values) => {
      // Values will be an array that contains an item
      // with the text of every selected file
      // ["File1 Content", "File2 Content" ... "FileN Content"]
      console.log(values);
      for (let i = 0; i < values.length; i++) {
        arrVar = values[i].split('\n');
        arrVar.splice(arrVar.length - 1);
        values[i] = arrVar.join();
        //allText = allText + arrVar.toString(); //set a MAP*/

        document.getElementById('fileNamesId').innerHTML = document.getElementById('fileNamesId').innerHTML + '<span class="c_filesList"><i class="far fa-file-alt"></i>'+document.getElementById('file').files[i].name+'</span>'

      }
      allText = values.join();
      lines = allText.split('\r,');
  });
}, false);
/****************************************************************************************************/
/****************************************************************************************************/
function download_csv(csv, filename) {
  var csvFile;
  var downloadLink;

  // CSV FILE
  csvFile = new Blob([csv], { type: "text/csv" });

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
    csv[i] = csv[i].substr(1,csv[i].length)
  }

  // Download CSV
  download_csv(csv.join("\n"), filename);
}
/****************************************************************************************************/
/****************************************************************************************************/
function downloadFileCSV() {
  var html = document.querySelector("table").outerHTML;
  periodo = $('#nameFile').val();
  export_table_to_csv(html, "Bressan_" + periodo + ".csv");
  pop();
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
function getIIBBdata(i) {
  //for (var i = 0; i < 48; i++) {
  var num = lines[i].substring(139, 244).replace(/^0+/, '') / Number('1e+' + (lines[i].substring(139, 244).replace(/^0+/, '').length - 2));
  //console.log(Number(num));
  return financial(num);
  //}
}
/****************************************************************************************************/
/****************************************************************************************************/
function pop() {
  /*var popup = document.getElementById('myPopup');
  popup.classList.toggle('show');*/
  // Get the modal
  var modal = document.getElementById("myModal");

  // Get the button that opens the modal
  var btn = document.getElementById("myBtn");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks the button, open the modal 
  //btn.onclick = function() {
  modal.style.display = "block";
  //}

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}
/****************************************************************************************************/
/****************************************************************************************************/
function processDocument(){
  if(Array_date[0] == 0 && document.getElementById('file').files.length > 0){
    fillArray();
  }else{
    alert('Archivo Incorrecto o no se ha subido ningún archivo !!!');
  }
}
/****************************************************************************************************/
/****************************************************************************************************/
function removerFilas() {
  const checkboxes = document.querySelectorAll('.remove-checkbox');
  checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
          const row = checkbox.closest('tr');
          row.remove(); // Eliminar la fila completa
      }
  });
  
  // Selecciona el elemento TOTAL_PERC
    const totalDiv     = document.getElementById("TOTAL_ID");
    const divRows      = document.getElementById("NUM_ROWS");
    //const totalDivPerc = document.getElementById("TOTAL_PERC");

  // Mientras el elemento tenga un primer hijo, lo elimina
      while (totalDiv.firstChild) {
        totalDiv.removeChild(totalDiv.firstChild);
      }/*
      while (totalDivPerc.firstChild) {
        totalDivPerc.removeChild(totalDivPerc.firstChild);
      }*/

  var div = document.createElement("div");
  div.innerHTML = reCalcularPerc();

  document.getElementById("TOTAL_ID").appendChild(div);
  //document.getElementById("TOTAL_PERC").appendChild(div);
  divRows.innerHTML = $('table tbody tr').length;
  document.getElementById("NUM_ROWS").appendChild(divRows);
 
}
/****************************************************************************************************/
/****************************************************************************************************/
function reCalcularPerc(){
  var reCalculo = financial(0);

  for (let i = 0; i < $('table tbody tr').length; i++) {
    var tBodyTr = $('table tbody tr')[i]
    var tdPerc = $(tBodyTr).find('td')[9].innerText;  
        tdPerc = financial(tdPerc);   
    reCalculo = Number(reCalculo) + Number(tdPerc);

  }

  return reCalculo;

}
/****************************************************************************************************/
/****************************************************************************************************/
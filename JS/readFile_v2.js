var lines;
var Array_date = [0];
var allText = '';
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
// Función para eliminar acentos y caracteres especiales
function eliminarAcentos(texto) {
  return texto
      .normalize("NFD") // Descompone el texto en base y diacríticos
      .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos (acentos)
      .replace(/[^\w\s]/g, "") // Elimina caracteres especiales
      .replace(/\s+/g, "_") // Reemplaza espacios por guiones bajos
      .toLowerCase(); // Convierte el texto a minúsculas
}

function createTable(tableData) {
    var table = document.createElement('table');
    table.style.width = '100%'; // Hacer que la tabla ocupe todo el ancho de la pantalla
    table.style.borderCollapse = 'collapse'; // Mantener bordes colapsados

    var tableBody = document.createElement('tbody');
    var thead = document.createElement('thead');

    table.appendChild(thead);

    // Crear encabezados de la tabla
    let headerIDs = []; // Array para guardar los IDs de las cabeceras

    for (var i = 0; i < orderArrayHeader.length; i++) {
        var th = document.createElement("th");
        var headerID = eliminarAcentos(orderArrayHeader[i]);
        th.id = headerID;
        th.appendChild(document.createTextNode(orderArrayHeader[i]));
        th.style.border = '1px solid #ddd'; // Estilo de borde
        th.style.padding = '8px'; // Espaciado interno
        th.style.textAlign = 'left'; // Alinear texto a la izquierda
        thead.appendChild(th);
        headerIDs.push(headerID);
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
        checkboxCell.setAttribute("headers", headerIDs[0]); // Asignar headers al checkbox
        checkboxCell.style.border = '1px solid #ddd'; // Estilo de borde
        checkboxCell.style.padding = '8px'; // Espaciado interno
        row.appendChild(checkboxCell);

        // Crear las demás celdas con los datos de la fila
        rowData.forEach(function (cellData, index) {
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            cell.setAttribute("headers", headerIDs[index + 1]); // +1 porque la primera celda es el checkbox
            cell.style.border = '1px solid #ddd'; // Estilo de borde
            cell.style.padding = '8px'; // Espaciado interno

            // Hacer editable la columna "ALICUOTA" (índice 7)
            if (index === 7) {
                cell.contentEditable = true;
                cell.style.backgroundColor = '#f9f9f9'; // Color de fondo para destacar

                // Agregar evento para recalcular el valor de la columna 8
                cell.addEventListener('input', function () {
                    const row = cell.parentElement; // Obtener la fila actual
                    const montoSujetoPerc = parseFloat(row.cells[7].innerText) || 0; // Columna índice 6
                    const porcentaje = parseFloat(cell.innerText) || 0; // Columna índice 7
                    const resultado = (montoSujetoPerc * porcentaje) / 100; // Calcular el nuevo valor
                    row.cells[9].innerText = financial(resultado); // Actualizar la columna índice 8
                });
            }

            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });

    table.appendChild(tableBody);
    document.getElementById("main").innerHTML = ''; // Limpiar contenido previo
    document.getElementById("main").appendChild(table);
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

      iibb_calc = (0.4 / 100) * neto_gravado;

      count_rows = i + 1;

          checkbox = document.createElement("input");
          checkbox.setAttribute("type", "checkbox");
          checkbox.classList.add("remove-checkbox");

      Array_date[z] = [
         '00' + (z + 1)                            //Número de Renglon
        , tipo_factura_num                             //Tipo de Comprobante
        , letra                                        //Letra
        , num_factura                                  //Numero de Comprobante
        , lines[i].substring(37, 48)                    //CUIT
        , fecha                                        //Fecha de Percepción
        , financial(neto_gravado)                      //Monto Sujeto a Pecepción,
        , '0.4'                                        //Alicuota
        , financial(iibb_calc)                         //Monto Percibido calculado
        , '11'                                         //Tipo de Regimen
        , '904'                                        //Juridicción
        , '1'                                          //Tipo de Operacion
        , '1'                                          //Num de Constancia Original
      ]
      z++;
  }

  for (var x = 0; x < Array_date.length; x++) {
    total = total + Number(Array_date[x][8]);
  }

  createTable(Array_date);
}
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
      console.log(values);
      for (let i = 0; i < values.length; i++) {
        arrVar = values[i].split('\n');
        arrVar.splice(arrVar.length - 1);
        values[i] = arrVar.join();

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

  csvFile = new Blob([csv], { type: "text/csv" });

  downloadLink = document.createElement("a");

  downloadLink.download = filename;

  downloadLink.href = window.URL.createObjectURL(csvFile);

  downloadLink.style.display = "none";

  document.body.appendChild(downloadLink);

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
  var numberOutput = Math.abs(number);
  var length = number.toString().length;
  var zero = "0";

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
  var num = lines[i].substring(139, 244).replace(/^0+/, '') / Number('1e+' + (lines[i].substring(139, 244).replace(/^0+/, '').length - 2));
  return financial(num);
}
/****************************************************************************************************/
/****************************************************************************************************/
function pop() {
  var modal = document.getElementById("myModal");

  modal.style.display = "block";

  var span = document.getElementsByClassName("close")[0];

  span.onclick = function () {
    modal.style.display = "none";
  }

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
          row.remove();
      }
  });
  
  const totalDiv     = document.getElementById("TOTAL_ID");
  const divRows      = document.getElementById("NUM_ROWS");

  while (totalDiv.firstChild) {
    totalDiv.removeChild(totalDiv.firstChild);
  }

  var div = document.createElement("div");
  div.innerHTML = reCalcularPerc();

  document.getElementById("TOTAL_ID").appendChild(div);
  divRows.innerHTML = $('table tbody tr').length;
  document.getElementById("NUM_ROWS").appendChild(divRows);
}
/****************************************************************************************************/
/****************************************************************************************************/
function refreshCalculation(){
  const totalDiv     = document.getElementById("TOTAL_ID");
  const divRows      = document.getElementById("NUM_ROWS");

  while (totalDiv.firstChild) {
    totalDiv.removeChild(totalDiv.firstChild);
  }

  var div = document.createElement("div");
  div.innerHTML = reCalcularPerc();

  document.getElementById("TOTAL_ID").appendChild(div);
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
function mostrarPopUp() {
  document.getElementById("modalPopUp").style.display = "block";
}
/****************************************************************************************************/
/****************************************************************************************************/
function cerrarPopUp() {
  document.getElementById("modalPopUp").style.display = "none";
}
/****************************************************************************************************/
/****************************************************************************************************/
function eliminarFacturas() {
  const listaFacturas = document.getElementById("listaFacturas").value
      .split("\n")
      .map(factura => factura.trim())
      .filter(factura => factura.length > 0)
      .map(factura => parseInt(factura, 10));

  const filas = document.querySelectorAll("table tbody tr");

  filas.forEach(fila => {
      const numeroFactura = parseInt(fila.cells[4].innerText.trim(), 10);
      if (listaFacturas.includes(numeroFactura)) {
          fila.remove();
      }
  });
  refreshCalculation();
  cerrarPopUp();
}

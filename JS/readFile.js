function processFiles(files) {
  var file = files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    
    var output = document.getElementById("fileOutput");
    output.textContent = e.target.result;
  };
  reader.readAsText(file);
}
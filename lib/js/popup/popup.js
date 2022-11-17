var slider1 = document.getElementById("myRange1");
var output1 = document.getElementById("demo1");
output1.innerHTML = slider1.value;

slider1.oninput = function() {
  output1.innerHTML = this.value;
}
var slider2 = document.getElementById("myRange2");
var output2 = document.getElementById("demo2");
output2.innerHTML = slider2.value;

slider2.oninput = function() {
  output2.innerHTML = this.value;
}

function save_options() {
  var minViewCount = document.getElementById('myRange1').value;
  var maxViewCount = document.getElementById('myRange2').value;
  chrome.storage.sync.set({
    minViewCount: parseInt(minViewCount),
    maxViewCount: parseInt(maxViewCount)
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    minViewCount: 0,
    maxViewCount: 15
  }, function(items) {
    document.getElementById('myRange1').value = items.minViewCount;
    document.getElementById('demo1').innerHTML = items.minViewCount;
    document.getElementById('myRange2').value = items.maxViewCount;
    document.getElementById('demo2').innerHTML = items.maxViewCount;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
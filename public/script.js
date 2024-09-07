
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference messages collection
var messagesRef = firebase.database().ref("image");

// Listen for form submit

function uploadImage() {
  const fileInput = document.getElementById("file");
  const uploadButton = document.getElementById("upload");

  if (fileInput.files.length === 0) {
    uploadButton.textContent = "Please select a file";
    setTimeout(() => {
      uploadButton.textContent = "Upload";
    }, 2000);
    return;
  }

  const file = fileInput.files[0];
  const storageRef = firebase.storage().ref("files/" + file.name);
  const uploadTask = storageRef.put(file);

  uploadButton.textContent = "Uploading...";

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(2);
      uploadButton.textContent = `Uploading ${progress}%...`;
    },
    (error) => {
      console.error(error.message);
      uploadButton.textContent = "Upload Failed";
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log("File available at", downloadURL);
        saveMessage(downloadURL);
      });
    }
  );
}

// Save message to firebase
function saveMessage(downloadURL) {
  var newMessageRef = messagesRef.push();
  var unique = createUniquenumber();
  // Hidding recive file div
  var x = document.getElementById("downloadiv");
  x.style.display = "none";
  var showUnique = document.getElementById("ShowUniqueID");
  var shU = document.getElementById("showunique");
  shU.value = unique;
  showUnique.style.display = "block";
  // showUnique.value = unique;
  newMessageRef.set({
    url: downloadURL,
    number: unique,
  });
  document.getElementById("upload").innerHTML = "Upload Successful";
  //Make file input empty
  document.getElementById("file").value = "";
}

function createUniquenumber() {
  // Create a unique 5 digit number for each image which is not in the database field number yet
  var number = Math.floor(10000 + Math.random() * 90000);
  var ref = firebase.database().ref("image");
  ref.on("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var childData = childSnapshot.val();
      if (childData.number == number) {
        createUniquenumber();
      }
    });
  });
  return number;
}

//   // After some time if flag is still 0 then show alert
//   // setTimeout(function(){

//   // if(flag == 0){
//   //     alert("File not found Check the Unique ID");
//   // }
//   // }, 5000);

function showimage() {
  var uniqueId = document.getElementById("unique").value;
  if (uniqueId == "") {
    alert("Unique Id is empty\n Please enter a Unique Id");
    return;
  }
  var ref = firebase.database().ref("image");
  var flag = 0;
  ref.on("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var childData = childSnapshot.val();
      if (childData.number == uniqueId) {
        flag = 1;
        window.open(childData.url, "_blank");
        // After this delete the image from the database
        ref.child(childSnapshot.key).remove();
        // Remove file from storage
        // Run this with 5 sec delay
        setTimeout(function () {
          var storageRef = firebase.storage().refFromURL(childData.url);
          storageRef
            .delete()
            .then(function () {
              ref.child(childSnapshot.key).remove();
              // File deleted successfully
            })
            .catch(function (error) {
              console.error("Error removing file:", error);
            });
        }, 5000); // Adjusted to 5 sec delay
      }
    });
    // Check if the flag is still 0 after 5 seconds
    setTimeout(function () {
      if (flag == 0) {
        alert("File not found. Check the Unique ID");
      }
    }, 5000); // Adjusted delay to match
  });
}


function checkFileSize() {
  var file = document.getElementById("file").files[0];
  // Dont allow file size greater than 100MB
  if (file.size > 100000000) {
    alert(
      "File size is greater than 100MB\n Please select a file less than 100MB"
    );
    document.getElementById("file").value = "";
  }
}

// Click on download button when enter is pressed
document.getElementById("unique").addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("show").click();
  }
});

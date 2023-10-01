// Define the configuration for success and error messages.
const cfConfig = {
  error: {
    title: "Error!",
    message: "Sorry, an error occurred while receiving your message. Please try another method of contact.",
  },
  success: {
    title: "Message Sent Successfully",
    message: "Thank you for contacting us. We will get back to you soon.",
  },
};

// Define the HTML structure for the contact form.
const cfbody = `
<div class="box right-button" id="cf" style="display: inline-block; z-index: 9999;">
	<div class="button color" onclick="cfClick();"><span class="m-cf-icon-default"><i class="material-icons">chat_bubble</i></span><span class="cl-icon"><i class="material-icons">arrow_downward</i></span></div>
	<div class="panel" id="cfcontent"></div>
</div>
`;

const cfform = `
<h3 class="title">Contact Me</h3>
<p>Drop a message, and we'll contact you soon.</p>
<div>
	<input class="element" onchange="cfonChange('cfname')" id="cfname" type="text" name="name" placeholder="Name" autocomplete="off">
	<input class="element" onchange="cfonChange('cfemail')" id="cfemail" type="email" name="email" placeholder="Email" autocomplete="off">
	<input class="element" onchange="cfonChange('cfphone')" id="cfphone" type="tel" name="phoneno" placeholder="Phone No." autocomplete="off" maxlength="14">
	<input class="element" onchange="cfonChange('cfsubject')" id="cfsubject" type="text" name="subject" placeholder="Subject" autocomplete="off">
	<textarea class="element" onchange="cfonChange('cfmessage')" id="cfmessage" name="message" placeholder="Your message"></textarea>
	<button id="cfbutton" onclick="cfSubmitMessage()" class="form-button color">Send</button>
</div>
`;

// Function to handle form submission
async function cfSubmitMessage() {
  // Get form values
  var cfvalue = {
    name: GEBID("cfname").value,
    email: GEBID("cfemail").value.toLowerCase(),
    phone_no: GEBID("cfphone").value,
    subject: GEBID("cfsubject").value,
    message: GEBID("cfmessage").value,
  };

  // Regular expression to validate email
  let emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

  // Form validation
  if (cfvalue.name === "") {
    GEBID("cfname").classList.add("error");
  } else if (!emailRegex.test(cfvalue.email)) {
    GEBID("cfemail").classList.add("error");
  } else if (cfvalue.phone_no === "") {
    GEBID("cfphone").classList.add("error");
  } else if (cfvalue.subject === "") {
    GEBID("cfsubject").classList.add("error");
  } else if (cfvalue.message === "") {
    GEBID("cfmessage").classList.add("error");
  } else {
    // Disable button and show "Sending" message
    GEBID("cfbutton").removeAttribute("onclick");
    GEBID("cfbutton").classList.remove("color");
    GEBID("cfbutton").classList.add("onclick");
    GEBID("cfbutton").innerHTML = "Sending...";

    try {
      // Send the form data to the server using fetch
      var sendmessage = await (
        await fetch(
          document.getElementById("contactform").getAttribute("form_worker_url"),
          {
            method: "POST",
            body: JSON.stringify(cfvalue),
          }
        )
      ).json();

      if (sendmessage.status) {
        // Show success message and store form submission status in local storage
        GEBID("cfcontent").innerHTML = createHtmlFromObj(cfConfig.success);

        localStorage.setItem(
          "contact-form",
          JSON.stringify({
            sent: true,
            canSendUnix: new Date().getTime() + 43200000,
          })
        );
      } else {
        throw new Error("Error");
      }
    } catch (error) {
      console.log(error);
      // Show error message
      GEBID("cfcontent").innerHTML = createHtmlFromObj(cfConfig.error);
    }
  }
}

// Function to remove error class on input change
function cfonChange(id) {
  GEBID(id).classList.remove("error");
}

// Function to get element by ID
function GEBID(id) {
  return document.getElementById(id);
}

// Function to create HTML from configuration object
function createHtmlFromObj({ title, message }) {
  return `<h3 class="title">${title}</h3><p>${message}</p>`;
}

// Add styles and load the form after the page is fully loaded
window.onload = () => {
  var cfstylesheet = document.createElement("link");
  cfstylesheet.rel = "stylesheet";
  cfstylesheet.href = `/src/cf.css`;
  document.getElementsByTagName("head")[0].appendChild(cfstylesheet);

  cfstylesheet.onload = function () {
    var cfdiv = document.createElement("section");
    cfdiv.classList.add("contact-form-cf");
    cfdiv.innerHTML = cfbody;
    document.getElementsByTagName("body")[0].appendChild(cfdiv);

    var cfresult = JSON.parse(localStorage.getItem("contact-form"));
    if (
      GEBID("contactform").getAttribute("disable_waittime") !== "true" &&
      cfresult &&
      cfresult.sent &&
      cfresult.canSendUnix > new Date().getTime()
    ) {
      GEBID("cfcontent").innerHTML = createHtmlFromObj(cfConfig.success);
    } else {
      GEBID("cfcontent").innerHTML = cfform;
    }
  };
};

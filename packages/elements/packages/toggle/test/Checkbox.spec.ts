// .value getter works

// input events are emitted on changes (also emits when changed via .value)

// change events are emitted on changes (only emits when changed by the users input)

// Formadata values are set

// <form id="form">
//     <simple-element name="simple"></simple-element>
//     <modern-element name="modern"></modern-element>
//     <button type="submit">Submit</button>
// </form>
// <script>
//   form.onsubmit = (e) => {
//    	e.preventDefault();
//    	console.log("formData", new Map(new FormData(e.currentTarget)));
//   };
// </script>

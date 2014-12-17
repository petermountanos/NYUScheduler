var cartToggle = [true, true, true, true, true, true, true];
var courseToggle = [true, true, true, true, true, true, true];

$(document).ready(function() {
 $('#calendar').fullCalendar({
    header: {
      left: 'prev,next',
      center: '',
      right: 'agendaWeek,agendaDay'
    },
    defaultView: 'agendaWeek',
    weekends: false,
    editable: false,
    allDaySlot: false,
    minTime: "08:00:00",
    maxTime: "18:00:00",
    height: 500
  });

  for (var i = 2; i <= 5; i++) {
    $("#coursesTable").find('td:nth-child(' + i + '), th:nth-child(' + i + ')').hide();
    courseToggle[i] = !courseToggle[i];
  }

  $.getJSON("http://websys3.stern.nyu.edu:7001/getColleges", function(data){
      $.each(data, function(key, value) {   
        $('#collegesList')
            .append($("<option></option>")
            .attr("value",value["name:"])
            .text(value["name:"])); 
      }); 
  });

  $('[data-toggle=offcanvas]').click(function() {
    $('.row-offcanvas').toggleClass('active');
  });
});

$( "#collegesList" ).change(function () {
  var str = $("#collegesList option:selected").val();
  $('#deptList').children().remove();
  $('#deptList')
    .append($("<option></option>")
    .attr("value","null")
    .text("Select a department")); 
    
  $.getJSON("http://websys3.stern.nyu.edu:7001/getDepts?college="+str, function(data){
      $.each(data, function(key, value) {   
          $('#deptList')
            .append($("<option></option>")
            .attr("value",value["department_code"])
            .text(value["department_name"] + " ("+value["department_code"] + ")")); 
        }); 
  });
}).change();

$("#deptList").change(function() {
  var str = $("#deptList option:selected").val();

  $("#coursesTable").find("tr:gt(0)").remove();
  $("#coursesTable").find('td, th').show();
  $.getJSON("http://websys3.stern.nyu.edu:7001/getCourses?dept="+str, function(data){
    $.each(data, function(key, value) {
      var name   = value["course_name"] + " " + value["class_name"];
      var component = value["component"];

      if (component != "Lecture") {
        name += " (" + value["component"] + ")";
      }
      
      var id = value["_id"]["$oid"];
      var course = value["classification"] + " " + value["number"] + ", Sec. " + value["section"];
      var instructors = String(value["instructors"]).split(",");
      var instruct_bett = instructors[1] + " " + instructors[0];
      var meet_data   = value["meet_data"].slice(1,value["meet_data"].length-1);  
      
      var jsonArr = meet_data.split("}, ");
      var days =  "";
      
      for (var i = 0; i < jsonArr.length; i++) {
        var wrongJSON = jsonArr[i];
        if (wrongJSON[wrongJSON.length-1] != "}") {
          wrongJSON += "}"
        } 
        wrongJSON = wrongJSON.replace(/'/g, '"')

        var betterJSON = jQuery.parseJSON(wrongJSON);
        days += betterJSON["day"] + ", ";
        var time = betterJSON["start"] + " - " + betterJSON["end"];
      }

      days = days.slice(0, days.length-2);

      $('#coursesTable tr:last')
      .after('<tr><td class="name">' + name + '</td><td class="course">' + course + '</td><td class="instructor">' + instruct_bett + '</td><td class="days">' + days + '</td><td class="time">' + time + '</td><td class="input"><input type="checkbox" value="' + id +'"></td></tr>');
    }); 
  });
}).change();

function addCourses() {
  var table = document.getElementById("coursesTable");
  var inputs = table.getElementsByTagName("input");
  var arr = [];

  for (var i = 0, max = inputs.length; i < max; i += 1) {
    // Take only those inputs which are checkbox
    if (inputs[i].type === "checkbox" && inputs[i].checked) {
      arr.push(inputs[i].value);
    }
  }
  
  $.getJSON('http://websys3.stern.nyu.edu:7001/addCourses?courses=['+arr+"]", function(data) {
    var test = jQuery.parseJSON(data);
    $("#output").empty();
    $("#output").append("Successfully added "+ test["num"] +" courses to your cart!").css("color", "green");
  });
}

function removeCourses() {
  var table  = document.getElementById("cartTable");
  var inputs = table.getElementsByTagName("input");
  var arr = [];

  for (var i = 0, max = inputs.length; i < max; i += 1) {
    // Take only those inputs which are checkbox
    if (inputs[i].type === "checkbox" && inputs[i].checked) {
      arr.push(inputs[i].value);
    }
  }

  $.getJSON('http://websys3.stern.nyu.edu:7001/removeCourses?courses=['+arr+"]", function(data) {
    var test = jQuery.parseJSON(data);
  });
  showCart();
}


function showCart() {
  $("#cartTable").find("tr:gt(0)").remove();
  $.getJSON('http://websys3.stern.nyu.edu:7001/getCart', function(data) {
    $.each(data, function(key, value) {
      var name   = value["course_name"] + " " + value["class_name"];
      var component = value["component"];

      if (component != "Lecture") {
        name += " (" + value["component"] + ")";
      }

      var id = value["_id"]["$oid"];
      var course = value["classification"] + " " + value["number"] + ", Sec. " + value["section"];
      var instructors = String(value["instructors"]).split(",");
      var instruct_bett = instructors[1] + " " + instructors[0];
      var meet_data   = value["meet_data"].slice(1,value["meet_data"].length-1);  

      var jsonArr = meet_data.split("}, ");
      var days =  "";

      for (var i = 0; i < jsonArr.length; i++) {
        var wrongJSON = jsonArr[i];
        if (wrongJSON[wrongJSON.length-1] != "}") {
          wrongJSON += "}"
      } 
      wrongJSON = wrongJSON.replace(/'/g, '"')

      var betterJSON = jQuery.parseJSON(wrongJSON);
      days += betterJSON["day"] + ", ";
      var time = betterJSON["start"] + " - " + betterJSON["end"];
    }

    days = days.slice(0, days.length-2);

    $('#cartTable tr:last')
      .after('<tr><td class="name">' + name + '</td><td class="course">' + course + '</td><td class="instructor">' + instruct_bett + '</td><td class="days">' + days + '</td><td class="time">' + time + '</td><td class="input"><input type="checkbox" value="' + id +'"></td></tr>');
    });   

    for (var i = 2; i <= 5; i++) {
      $("#cartTable").find('td:nth-child(' + i + '), th:nth-child(' + i + ')').hide();
      cartToggle[i] = !cartToggle[i];
    }
  });
}

function hidefunction(t, col) {
  console.log("#"+t);
  if (t == "cartList") {
    if (cartToggle[col]) {
      $("#" + t).find('td:nth-child(' + col + '), th:nth-child(' + col + ')').hide();
      cartToggle[col] = !cartToggle[col];
    }
    else {
      $("#" + t).find('td:nth-child(' + col + '), th:nth-child(' + col + ')').show();
      cartToggle[col] = !cartToggle[col];
    }
  }
  else {
    if (courseToggle[col]) {
      $("#" + t).find('td:nth-child(' + col + '), th:nth-child(' + col + ')').hide();
      courseToggle[col] = !courseToggle[col];
    }
    else {
      $("#" + t).find('td:nth-child(' + col + '), th:nth-child(' + col + ')').show();
      courseToggle[col] = !courseToggle[col];
    }
  }
}

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        $('#calendar').fullCalendar('render');
    });
});
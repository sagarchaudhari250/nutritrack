$(document).ready(function(){
	// global variables
	var myItem;
	var singleNutri;
	var pageCount = 0;
	var searchString;
	var dailyLimit = localStorage.getItem("myLimit");

	//function to create cookies
	function setCookie(cname,cvalue,exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires=" + d.toGMTString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}

	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

	function checkCookie() {
		var user=getCookie("username");
		if (user != "") {
			$("#final-list").append(localStorage.getItem("myPage"));
			$(".daily-limit").text("Hi "+user.toUpperCase()+", you set daily calorie limit to "+ dailyLimit);
		} else {
			localStorage.clear();
			user = prompt("Please enter your name:","");
			dailyLimit = prompt("Set your calorie limit");
			localStorage.setItem("myLimit", dailyLimit);
			$(".daily-limit").text("Hi "+user.toUpperCase()+", you set daily calorie limit to "+ dailyLimit);
			if (user != "" && user != null) {
				setCookie("username", user, 1);
			}
		}
	}
	checkCookie();

	//to show autocomplete results
	$("#food-search").keyup(function(){
		$("#food-suggetions").css({"display":"flex"});
		var value = $(this).val();
		$.ajax({
			url: "/search/",
			data: {
				q : value
			},
			type: "GET",
			dataType:"json",
			success: function(data){
				$("#food-suggetions").empty();
				for(var i = 0; i < data.length; i++){
					$("#food-suggetions").append('<li class="list-group-item" data-id='+data[i].id+'>'+data[i].text+'</li>');
				}
			}
		});
	});


	//to set value in search input
	$(document).on("click", "#food-suggetions li", function(){
		$("#food-suggetions").css({"display":"none"});
		var inputValue = $(this).text();
		$("#food-search").val(inputValue);
	});

	//to show search result when press enter after typing query in search input
	$(document).on("keypress", "#food-search", function (e) {
		var key = e.which;
		if(key == 13){
			$("#food-suggetions").css({"display":"none"});
			$('#search').click();
			return false;  
		}
	});

	//function get get search results
	function searchedProducts(searchInput, offset){
		$.ajax({
			url: "https://api.nutritionix.com/v1_1/search/",
			data: {
				"appId": "af96dc5f",
				"appKey": "e6fef1590a42ea8f6b1cb64164f25c98",
				"fields": ["item_name","brand_name","nf_calories","nf_serving_size_qty","nf_serving_size_unit"],
				"offset":offset,
				"limit": 10,
				"query": searchInput,
				"filters": {
					"nf_calories": {
						"gte": 0
					}
				}
			},
			type: "POST",
			dataType: "json",
			success: function(data){
				myItem = data;

				$(".searched-item-list, .pagination").empty();
				$(".searched-item-list").append('<h4 class="consumed-food-title">Click on food you ate</h4><ul class="list-group" id="item-list"><li class="list-group-item item-list-header"><span>Food Item</span><span>Food Brand</span></li>')
				for(var i = 0; i < data.hits.length; i++){
					$(".searched-item-list").append('<li class="list-group-item item-list-data" data-toggle="modal" data-target="#smallShoes" data-id='+data.hits[i]._id+'>'+
						'<span>'+data.hits[i].fields.item_name+'</span>'+
						'<span>'+data.hits[i].fields.brand_name+'</span>'+
						'</li>'+
						'</ul>')
				}
				$(".pagination").append(
					'<span class="btn btn-primary" id="prev"><i class="fa fa-angle-double-left" aria-hidden="true"> Prev</i></span>'+
					'<span class="btn btn-primary" id="next">Next <i class="fa fa-angle-double-right" aria-hidden="true"></i></span>'
					);

				//show hide pagination buttons
				if(offset === 0){
					$("#prev").addClass("none");
				}else {
					$("#prev").removeClass("none");
				}
				if(data.hits.length === 0){
					$("#next").addClass("none");
				}else{
					$("#next").removeClass("none");
				}
			}
		});
	}

	//call ajax with next 
	$(document).on("click", "#next", function(){
		$(".pagination span").addClass("none")
		pageCount = pageCount+10;
		searchedProducts(searchString, pageCount);
	});

	$(document).on("click", "#prev", function(){
		pageCount = pageCount-10;
		searchedProducts(searchString, pageCount);
	})

	$(document).on("click", "#search", function(){
		$("#food-suggetions").css({"display":"none"});
		pageCount = 0;
		searchString = $("#food-search").val();
		if(searchString.length < 1){
			alert("Enter Search Keywords");
		}else{
			searchedProducts(searchString, pageCount);
		}
	});

	$(document).on("click", ".item-list-data", function(){
		var index = $(".item-list-data").index(this);
		$(".nutri-modal-title").text(myItem.hits[index].fields.item_name);
		$("#serving-count").val(myItem.hits[index].fields.nf_serving_size_qty);
		$("#servings-unit").text(myItem.hits[index].fields.nf_serving_size_unit);
		$("#serving-cal").text(myItem.hits[index].fields.nf_calories.toFixed(2));
		singleNutri = myItem.hits[index].fields.nf_calories / myItem.hits[index].fields.nf_serving_size_qty;
	});

	function incrementor(){
		var increCount = $("#serving-count").val();
		$("#serving-count").val(parseInt(increCount)+1);
	}

	function decrementor(){
		var decreCount = $("#serving-count").val();
		if(decreCount > 0){
			$("#serving-count").val(parseInt(decreCount)-1);
		}
	}

	function getNutriCount(){
		var nutriCount = $("#serving-count").val();
		var x = singleNutri*nutriCount;
		$("#serving-cal").text(x.toFixed(2));		
	}

	$(document).on("click", "#incrementor", function(){
		incrementor();
		getNutriCount();
	});

	$(document).on("click", "#decrementor", function(){
		decrementor();
		getNutriCount();
	});

	$(document).on("blur", "#serving-count", function(){
		if($("#serving-count").val() < 0 || $("#serving-count").val() != "number"){
			$(this).val("1");
		} 
		getNutriCount();
	})

	$(document).on("click", "#submit-food", function(){
		$(".searched-item-list, .pagination").empty();
		$("#final-list").append('<li class="list-group-item">'+
			'<span>'+$(".nutri-modal-title").text()+'</span>'+
			'<span>'+$("#serving-count").val()+'</span>'+
			'<span class="myCal">'+$("#serving-cal").text()+'</span>'+
			'<span><button class="btn btn-danger btn-sm delete">Delete</button></span>'+
			'</li>');
		grandTotal();
		localData();
	});
	grandTotal()

	$(document).on("click", ".delete", function(){
		$(this).closest('.list-group-item').remove();
		grandTotal();
		localData();
	})

	function grandTotal() {
		var grandTotalCal = 0;
		var finalListCount = $("#final-list li").length;
		for(var i = 0, j = 1; i < finalListCount; i++, j++){
			grandTotalCal += parseInt($("#final-list li:nth-of-type("+j+") .myCal").text());
		}
		$("#total-calorie").text(grandTotalCal);
		calorieWatch()
	}

	function localData(){
		if (typeof(Storage) !== "undefined") {
			var foodHistory = $("#final-list").html()
			localStorage.setItem("myPage", foodHistory);
		} else {
			window.alert("your browser dont support cookies");
		}
	}

	function calorieWatch(){
		var greenArea = dailyLimit - ((dailyLimit*20)/100);
		if(parseInt($("#total-calorie").text()) < greenArea){
			$(".grand-total").css({"background":"#28a745","color":"#fff"});
			$(".message").text("Your calorie intake is in limit, Great going!!!");
		}else if(parseInt($("#total-calorie").text()) <= dailyLimit){
			$(".grand-total").css({"background":"#ffc107", "color":"#000"});
			$(".message").text("About to reach your daily limit, Be careful before you eat.");
		}else {
			$(".grand-total").css({"background":"#dc3545", "color":"#fff"});
			$(".message").text("Daily limit crossed, Better luck next time.");
		}
	}
});


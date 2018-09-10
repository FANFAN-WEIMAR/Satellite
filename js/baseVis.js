var color_civil='#B2F560';
var color_commercial='#00BFFF';
var color_government='#CD70EC';
var color_military='#F4D03F';
var color_multiple='#CD5C5C';
var gray_color='darkgray';
var gray_opacity=0.1;
var init=true;
var processedData;
var timeRange=[1974,2018];
var condition=0;

function isDraw(){
  d3.select('#baseVis').remove();

  var url = "data/UCS_Satellite_Database.xlsx";
  var req = new XMLHttpRequest();
  req.open("GET", url,  true);
  req.responseType = "arraybuffer";
  req.onload = function(e) {
    var data = new Uint8Array(req.response);
    var arr=new Array();
    for(var i=0;i!=data.length;i++){
      arr[i]=String.fromCharCode(data[i]);
    }
    var bstr=arr.join("");
    var workbook = XLSX.read(bstr, {type:"binary"});
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    var rowData=XLSX.utils.sheet_to_json(worksheet);
    if(init==true){
      processedData=processing(rowData);
      init=false;
    }

    var checklist=filter();
    timeRange=timeSelect();
    countryPosition(condition);
    baseVis(processedData,checklist,timeRange);
  }
  req.send();
}

function baseVis(rowData,checklist,timeRange){
  // var width=window.innerWidth || document.documentElement.clientWidth|| document.body.clientWidth;
  // var height=window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;
  var svg=d3.select("#mainPlot").append('svg')
    .attr('height',2*height)
    .attr('width',width)
    .attr('id',"baseVis");

  var satellite=rowData[0];
  var borderLine=rowData[1];
  var detailedUsa=rowData[2];
  var detailedChina=rowData[3];
  var detailedRussia=rowData[4];
  var detailedOther=rowData[5];
  var detailBorder=[borderLine[0],borderLine[4]];
  var orbit=rowData[6];

  var updateSatellite;
  if(condition==0){
    updateSatellite=satellite;
  }else if (condition==1) {
    updateSatellite=detailedUsa;
  }else if (condition==2) {
    updateSatellite=detailedChina;
  }else if (condition==3) {
    updateSatellite=detailedRussia;
  }else if (condition==4) {
    updateSatellite=detailedOther;
  }

  console.log(updateSatellite);



  var div=d3.select('#mainPlot').append('div')
      .attr("class", "tooltip")
      .style("opacity", 0);

  var circles=svg.selectAll('circle')
      .data(updateSatellite)
      .enter()
      .append('svg:circle')
      .attr('cx',function(d){return d.x;})
      .attr('cy',function(d){return d.y;})
      .attr('id',function(d,i){return d.id;})
      .attr('class',function(d){return 'satellitePoint';})
      .attr('r',function(d){
        if (d.mass<100) {
          return 2.5;
        }else {
          return 1*Math.log(d.mass);}
        })
      .attr('stroke','white')
      .attr('fill',function(d){
        if(d.lifeDate[0]>=timeRange[0] && d.lifeDate[0]<=timeRange[1]){
          if(d.user=='Civil'){
            if(checklist.indexOf('civil')>-1){
              return color_civil;
            }else {
              return gray_color;
            }
          }else if (d.user=='Commercial'){
            if(checklist.indexOf('commercial')>-1){
              return color_commercial;
            }else {
              return gray_color;
            }
          }else if (d.user=='Government'){
            if(checklist.indexOf('government')>-1){
              return color_government;
            }else {
              return gray_color;
            }
          }else if (d.user=='Military'){
            if(checklist.indexOf('military')>-1){
              return color_military;
            }else {
              return gray_color;
            }
          }else {
            if(checklist.indexOf('multiple')>-1){
              return color_multiple;
            }else {
              return gray_color;
            }
          }
        }else {
          return gray_color;
        }
      })
      .attr('opacity',function(d){
        if(d.lifeDate[0]>=timeRange[0] && d.lifeDate[0]<=timeRange[1]){
          if(d.user=='Civil'){
            if(checklist.indexOf('civil')>-1){
              return 0.7;
            }else {
              return gray_opacity;
            }
          }else if (d.user=='Commercial'){
            if(checklist.indexOf('commercial')>-1){
              return 0.7;
            }else {
              return gray_opacity;
            }
          }else if (d.user=='Government'){
            if(checklist.indexOf('government')>-1){
              return 0.7;
            }else {
              return gray_opacity;
            }
          }else if (d.user=='Military'){
            if(checklist.indexOf('military')>-1){
              return 0.7;
            }else {
              return gray_opacity;
            }
          }else {
            if(checklist.indexOf('multiple')>-1){
              return 0.7;
            }else {
              return gray_opacity;
            }
          }
        }else {
          return gray_opacity;
        }
      })
      .on('mouseover', function(d){
        d3.select(this).transition().duration(500)
          .attr('r',function(d) {
            if (d.mass<100) {
              return 5;
            }else {
              return 2*Math.log(d.mass);}
          });
        div.transition()
           .duration(100)
           .style("opacity", 0.8)
           .style("background-color", 'white')
           .style("position",'fixed')
           .style("border-radius","5px");;
        div.html("Name: "+d.name+ "<br/>"+
                 "Purpose: "+ d.purpose+"_"+d.user+"<br/>"+
                 "Country: "+ d.country+"<br/>"+
                 "Launch Date: "+ d.date)
           .style("left",d.x + "px")
           .style("top", d.y-document.documentElement.scrollTop + "px")
           .style("padding","10px")

        })
      .on("mouseout", function(d) {
          d3.select(this).transition().duration(500)
            .attr('r',function(d) {
              if (d.mass<100) {
                return 2.5;
              }else {
                return Math.log(d.mass);}
            });
         div.transition()
            .duration(500)
            .style("opacity", 0);
        });




  if(condition==0){
    var borderUpdate=borderLine;
  }else {
    var borderUpdate=detailBorder;
  }

  var lines=svg.selectAll('line')
      .data(borderUpdate)
      .enter()
      .append('svg:line')
      .attr('x1',function(d){return d.x1;})
      .attr('y1',function(d){return d.y1;})
      .attr('x2',function(d){return d.x2;})
      .attr('y2',function(d){return d.y2;})
      .attr('id',function(d,i){return d.id;})
      .attr('stroke','gray')
      .attr('stroke-width','3')
      .attr('opacity', 0.5);

  var leo=parseInt(orbit[0])-2*border;
  var geo=parseInt(orbit[1])-2*border;
  var land=3*border-10;

  d3.select("#leo").style("position","absolute")
    .style("top",land+"px")
    .style("width","100%")
    .style("height",leo+"px")
    .style("background-color","gray")
    .style("z-index","-2")
    .style("opacity",0.1);

  d3.select("#meo").style("position","absolute")
    .style("top",leo+land+"px")
    .style("width","100%")
    .style("height",(geo-leo-border)+"px")
    .style("background-color","#BCBCBC")
    .style("z-index","-2")
    .style("opacity",0.1);

  d3.select("#geo").style("position","absolute")
    .style("top",geo+1.8*border+"px")
    .style("width","100%")
    .style("height",20+"px")
    .style("background-color","blue")
    .style("z-index","-2")
    .style("opacity",0.2);
}

function filter(){
  var checklist=[];
  var civilCheck=document.getElementById('civil');
  var commercialCheck=document.getElementById('commercial');
  var governmentCheck=document.getElementById('government');
  var militaryCheck=document.getElementById('military');
  var multipleCheck=document.getElementById('multiple');
  if(civilCheck.checked==true){
    checklist.push('civil');
  }
  if(commercialCheck.checked==true){
    checklist.push('commercial');
  }
  if(governmentCheck.checked==true){
    checklist.push('government');
  }
  if(militaryCheck.checked==true){
    checklist.push('military');
  }
  if(multipleCheck.checked==true){
    checklist.push('multiple');
  }
  return checklist;
}

function timeSelect(){
  var slider = $("#range").data("ionRangeSlider");
  var from = slider.result.from;
  var to = slider.result.to;
  var values=[from,to];
  return values;
}

function countryPosition(condition){
  var usaText=document.getElementById('usa');
  var chinaText=document.getElementById('china');
  var russiaText=document.getElementById('russia');
  var othersText=document.getElementById('others');
  if(condition==0){
    usaText.style.left=(firstBorderX+secondBorderX-2*border)/2+'px';
    chinaText.style.left=(secondBorderX+thirdBorderX-2*border)/2+'px';
    russiaText.style.left=(thirdBorderX+fourthBorderX-2*border)/2+'px';
    othersText.style.left=(fourthBorderX+fifthBorderX-2*border)/2+'px';
    usaText.style.opacity=1;
    chinaText.style.opacity=1;
    russiaText.style.opacity=1;
    othersText.style.opacity=1;
  }else if (condition==1) {
    usaText.style.left=(firstBorderX+fifthBorderX-2*border)/2+'px';
    chinaText.style.opacity=0;
    russiaText.style.opacity=0;
    othersText.style.opacity=0;
  }else if (condition==2) {
    usaText.style.opacity=0;
    chinaText.style.left=(firstBorderX+fifthBorderX-2*border)/2+'px';
    russiaText.style.opacity=0;
    othersText.style.opacity=0;
  }else if (condition==3) {
    usaText.style.opacity=0;
    chinaText.style.opacity=0;
    russiaText.style.left=(firstBorderX+fifthBorderX-2*border)/2+'px';
    othersText.style.opacity=0;
  }else if (condition==4) {
    usaText.style.opacity=0;
    chinaText.style.opacity=0;
    russiaText.style.opacity=0;
    othersText.style.left=(firstBorderX+fifthBorderX-2*border)/2+'px';
  }
}

function extendUsa(){
  if(condition==0){
    condition=1;
  }else {
    condition=0;
  }
  isDraw();
}
function extendChina(){
  if(condition==0){
    condition=2;
  }else {
    condition=0;
  }
  isDraw();
}
function extendRussia(){
  if(condition==0){
    condition=3;
  }else {
    condition=0;
  }
  isDraw();
}
function extendOthers(){
  if(condition==0){
    condition=4;
  }else {
    condition=0;
  }
  isDraw();
}

function getY(id){
  var temp=id.split(",")
  var yLow=parseFloat(temp[0]);
  var yHigh=parseFloat(temp[1]);

  return [yLow,yHigh];
}
function orbitMove(){
  var allCircles=document.getElementsByClassName('satellitePoint');
  for(var i=0;i<allCircles.length;i++){
    var id=allCircles[i].id;
    var yValues=getY(id);
    d3.select(allCircles[i]).transition().duration(2000)
      .attr('cy',yValues[1])
      .transition()
      .attr('cy',yValues[0]);
  }
}

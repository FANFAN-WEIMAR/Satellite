var minPerigee=0;
var maxApogee=0;
var border=50;
var width=window.innerWidth || document.documentElement.clientWidth|| document.body.clientWidth;
var height=window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;
var moveBorder=15;
var trueWidth=width-3*moveBorder-2*border;
var trueHeight=height-4*border;
var firstBorderX;
var secondBorderX;
var thirdBorderX;
var fourthBorderX;
var fifthBorderX;
var geo;
var leo;
var newHeight,newHeight1,newHeight2;
var firstLine,secondLine;

function processing(rowData){
  var finalData=new Array();
  var processedData=new Array();
  for (var i=0;i<rowData.length;i++){
    var apogee=parseInt(rowData[i].Apogee);
    var eccentricity=parseFloat(rowData[i].Eccentricity);
    if(isNaN(parseInt(rowData[i].Lifetime))){
      var lifetime=100;
    }else {
      var lifetime=parseInt(rowData[i].Lifetime);
    }
    var longitude=parseFloat(rowData[i].Longitude);
    var mass=parseInt(rowData[i].Mass);
    var period=parseFloat(rowData[i].Period);
    var perigee=parseInt(rowData[i].Perigee);
    var inclination=parseFloat(rowData[i].Inclination);
    var month=parseFloat(rowData[i].Date);
    var year=parseFloat(rowData[i].Date.split("/").pop());
    if (year<20){
      year=2000+year;
    }else {
      year=1900+year;
    }
    var date=year+month/100;
    var endOfLife=date+lifetime;
    processedData.push({
      name:rowData[i].Name,
      country:rowData[i].Country,
      operator:rowData[i].Operator,
      user:rowData[i].Users,
      purpose:rowData[i].Purpose,
      classOfOrbit:rowData[i].ClassofOrbit,
      longitude:longitude,
      perigee:perigee,
      apogee:apogee,
      eccentricity:eccentricity,
      inclination:inclination,
      period:period,
      mass:mass,
      lifetime:lifetime,
      launchSite:rowData[i].LaunchSite,
      launchVehicle:rowData[i].LaunchVehicle,
      cospar:rowData[i].COSPARNumber,
      norad:rowData[i].NORADNumber,
      comments:rowData[i].Comments,
      date:date,
      lifeDate:[date,endOfLife],
    })
  }
  processedData=_.filter(processedData, _.conforms({ 'mass': function(n) { return n >0; } }));
  processedData=_.sortBy(processedData,[function(o){return o.perigee}]);
  minPerigee= _.minBy(processedData,'perigee').perigee;
  maxApogee= _.maxBy(processedData,'apogee').apogee;

  for (var i=0;i<processedData.length;i++){
    if(processedData[i].country!='USA'&& processedData[i].country!='China'&& processedData[i].country!='Russia'){
      processedData[i].country='other';
    }
  }
  var other=new Array();
  var china=new Array();
  var usa=new Array();
  var russia=new Array();
  for (var i=0;i<processedData.length;i++){
    if(processedData[i].country=='USA'){
      usa.push(processedData[i]);
    }else if (processedData[i].country=='China') {
      china.push(processedData[i]);
    }else if (processedData[i].country=='Russia') {
      russia.push(processedData[i]);
    }else if (processedData[i].country=='other') {
      other.push(processedData[i]);
    }
  }

  usa=countryData(usa,border,0.35);
  var chinaBorder=trueWidth*0.35+border+moveBorder;
  china=countryData(china,chinaBorder,0.15);
  var russiaBorder=trueWidth*0.5+border+2*moveBorder;
  russia=countryData(russia,russiaBorder,0.22);
  var otherBorder=trueWidth*0.72+border+3*moveBorder;
  other=countryData(other,otherBorder,0.28);

  var satellite=usa.concat(china,russia,other);

  var detailedOther=detailedData(other,otherBorder,0.22);
  var detailedUsa=detailedData(usa,border,0.35)
  var detailedChina=detailedData(china,chinaBorder,0.15);
  var detailedRussia=detailedData(russia,russiaBorder,0.22);

  var firstBorder={x1:border-moveBorder,y1:3*border-moveBorder,x2:border-moveBorder,y2:3*border+2*trueHeight,id:1};
  var secondBorder={x1:chinaBorder-0.5*moveBorder,y1:3*border-moveBorder,x2:chinaBorder-0.5*moveBorder,y2:3*border+2*trueHeight,id:2};
  var thirdBorder={x1:russiaBorder-0.5*moveBorder,y1:3*border-moveBorder,x2:russiaBorder-0.5*moveBorder,y2:3*border+2*trueHeight,id:3};
  var fourthBorder={x1:otherBorder-0.5*moveBorder,y1:3*border-moveBorder,x2:otherBorder-0.5*moveBorder,y2:3*border+2*trueHeight,id:4};
  var fifthBorder={x1:trueWidth+2*border,y1:3*border-moveBorder,x2:trueWidth+2*border,y2:3*border+trueHeight,id:5};
  var borderSet=[firstBorder,secondBorder,thirdBorder,fourthBorder,fifthBorder];

  firstBorderX=firstBorder.x1;
  secondBorderX=secondBorder.x1;
  thirdBorderX=thirdBorder.x1;
  fourthBorderX=fourthBorder.x1;
  fifthBorderX=fifthBorder.x1;

  var orbitDate=orbit();
  // finalData=[satellite,borderSet];
  finalData=[satellite,borderSet,detailedUsa,detailedChina,detailedRussia,detailedOther,orbitDate];
  console.log(finalData);
  return finalData;
}

function countryData(data,startX,percentage){

  newWidth=trueWidth*percentage;
  newHeight=trueHeight;
  newHeight1=trueHeight*0.5;
  newHeight2=trueHeight*0.3;

  var index=0;
  for(var i=0;i<data.length-1;i++){
    if(data[i].perigee==data[i+1].perigee){
       data[i].index=index;
       index++
    }else {
      data[i].index=index;
      index=0;
    }
  }

  for(var i=0;i<data.length;i++){
    var count=0;
    for(var j=0;j<data.length;j++){
      if(data[i].perigee==data[j].perigee){
        count++;
      }
    }
    data[i].count=count;
  }
  firstLine=newHeight+2*border;
  secondLine=firstLine+newHeight1+border;
  for (var i=0;i<data.length;i++){
    if(data[i].perigee<=2000){
      var y=newHeight*data[i].perigee/(2000-minPerigee)+2*border;
    }else if (data[i].perigee>2000 && data[i].perigee<=50000) {
      var y=newHeight1*data[i].perigee/(50000-2000)+firstLine;
    }else {
      var y=newHeight2*data[i].perigee/(maxApogee-70000)+secondLine;
    }

    if(data[i].apogee<=2000){
      var yHight=newHeight*data[i].apogee/(2000-minPerigee)+3*border;
    }else if (data[i].apogee>2000 && data[i].apogee<=50000) {
      var yHight=newHeight1*data[i].apogee/(50000-2000)+firstLine;
    }else {
      var yHight=newHeight2*data[i].apogee/(maxApogee-70000)+secondLine;
    }
    // var y=newHeight*data[i].perigee/(maxApogee-minPerigee)+3*border;
    // var yHight=newHeight*data[i].apogee/(maxApogee-minPerigee)+3*border;

    var x=0;
    if(data[i].count<7){
      x=Math.random()*newWidth;
    }else {
      x=(newWidth/data[i].count)*data[i].index;
    }

    data[i].x=x+startX;
    data[i].y=y;
    data[i].id=[y,yHight]
  }
  return data;
}

function detailedData(data2,x0,percentage){
  var temp=new Array();
  for(var i=0;i<data2.length;i++){
    var x=(data2[i].x-x0)/percentage+border;
    temp.push({
      name:data2[i].name,
      country:data2[i].country,
      operator:data2[i].operator,
      user:data2[i].user,
      purpose:data2[i].purpose,
      classOfOrbit:data2[i].classOfOrbit,
      longitude:data2[i].longitude,
      perigee:data2[i].perigee,
      apogee:data2[i].apogee,
      eccentricity:data2[i].eccentricity,
      inclination:data2[i].inclination,
      period:data2[i].period,
      mass:data2[i].mass,
      lifetime:data2[i].lifetime,
      launchSite:data2[i].launchSite,
      launchVehicle:data2[i].launchVehicle,
      cospar:data2[i].cospar,
      norad:data2[i].norad,
      comments:data2[i].comments,
      date:data2[i].date,
      lifeDate:data2[i].lifeDate,
      y:data2[i].y,
      x:x,
      id:data2[i].id,
    })
  }
  return temp;
}

function orbit(){
  leo=newHeight;
  geo=newHeight1*35780/(50000-2000)+firstLine;
  return [leo,geo];
}

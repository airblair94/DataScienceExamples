function doTheTreeViz(control) {

    var svg = control.svg;

    var force = control.force;
    force.nodes(control.nodes)
        .links(control.links)
        .start();
    
    
    // Update the links
    var link = svg.selectAll("line.link")
        .data(control.links, function(d) { return d.unique; } );
 
    // Enter any new links
    link.enter().insert("svg:line", ".node")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
      .append("svg:title")
        .text(function(d) { return d.source[control.options.nodeLabel] + ":" + d.target[control.options.nodeLabel] ; });
    
    // Exit any old links.
    link.exit().remove();

    

    // Update the nodes
    var node = svg.selectAll("g.node")
        .data(control.nodes, function(d) { return d.unique; });

    node.select("circle")
        .style("fill", function(d) {
            return getColor(d);
        })
        .attr("r", function(d) {
            return getRadius(d);
        })

    // Enter any new nodes.
    var nodeEnter = node.enter()
      .append("svg:g")
        .attr("class", "node")
        // .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .on("click", function(d){
            var final = d.info.split("\n");
	    $("#info").empty();
	    $("#info").append("<h2>ID: " + d.name + "</h2>");
	    for (var i=0; i< final.length-1; i++){
		var parts = final[i].split(":");
		$("#info").append("<b>" + parts[0] + ":</b>  "+ parts[1] + "<br>");
	    }
        })
        .on("dblclick", function(d){
	   setTimeout(function(){	
                if (control.options.nodeFocus) {
		    d.isCurrentlyFocused = !d.isCurrentlyFocused;
                    doTheTreeViz(makeFilteredData(control));
                }
            },control.clickHack); 
        })
        .call(force.drag);

    nodeEnter
      .append("svg:circle")
        .attr("r", function(d) {
            return getRadius(d);
        })
        .style("fill", function(d) {
            return getColor(d);
        })
      .append("svg:title")
        .text(function(d) { return d[control.options.nodeLabel]; });

    if (control.options.nodeLabel) {         
       // text is done once for shadow as well as for text
        nodeEnter.append("svg:text")
            .attr("x", control.options.labelOffset)
            .attr("dy", ".31em")
            .attr("class", "shadow")
            .style("font-size",control.options.labelFontSize + "px")
            .text(function(d) {
                return d.shortName ? d.shortName : d.name;
            });
        nodeEnter.append("svg:text")
            .attr("x", control.options.labelOffset)
            .attr("dy", ".35em")
            .attr("class", "text")
            .style("font-size",control.options.labelFontSize + "px")
            .text(function(d) {
                return d.shortName ? d.shortName : d.name;
            });
    }

    // Exit any old nodes.
    node.exit().remove();
    control.link = svg.selectAll("line.link");
    control.node = svg.selectAll("g.node");
    force.on("tick", tick);



    if (control.options.linkName) {
        link.append("title")
            .text(function(d) {
                return d[control.options.linkName];
        });
    }

    var r = 3
    function tick() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
	.attr("cx", function(d) { return d.x = Math.max(r, Math.min(control.width - r, d.x)); }) 
        .attr("cy", function(d) { return d.y = Math.max(r, Math.min(control.height - r, d.y)); });

    }
    
    console.log("here")
    function getRadius(d) {
	var r = control.options.radius * (control.options.nodeResize ? Math.sqrt(d[control.options.nodeResize]) / Math.PI : 1);
	return control.options.nodeFocus && d.isCurrentlyFocused ? control.options.nodeFocusRadius  : r;
    }
    function getColor(d) {
        return control.options.nodeFocus && d.isCurrentlyFocused ? control.options.nodeFocusColor  : control.color(d.group) ;
    }

}

function makeFilteredData(control,selectedNode){
    // we'll keep only the data where filterned nodes are the source or target
    var newNodes = [];
    var newLinks = [];

    for (var i = 0; i < control.data.links.length ; i++) {
        var link = control.data.links[i];
        if (link.target.isCurrentlyFocused || link.source.isCurrentlyFocused) {
            newLinks.push(link);
            addNodeIfNotThere(link.source,newNodes);
            addNodeIfNotThere(link.target,newNodes);
        }
    }
    // if none are selected reinstate the whole dataset
    if (newNodes.length > 0) {
        control.links = newLinks;
        control.nodes = newNodes;
    }
    else {
        control.nodes = control.data.nodes;
        control.links = control.data.links;
    }
    return control;
    
    function addNodeIfNotThere( node, nodes) {
        for ( var i=0; i < nodes.length; i++) {
            if (nodes[i].unique == node.unique) return i;
        }
        return nodes.push(node) -1;
    }
}

function organizeData(control) {

    for (var i=0; i < control.nodes.length; i ++ ) {
        var node = control.nodes[i]; 
        node.unique = i;
        node.isCurrentlyFocused = false;
    }
    
    for (var i=0; i < control.links.length; i ++ ) {
        var link = control.links[i];
        link.unique = i;
        link.source = control.nodes[link.source];
        link.target = control.nodes[link.target];
    }
    return control;
}


function initialize () {
 
    var initPromise = $.Deferred();

    getTheData().then( function (data) {  
        var control = {};
        control.data = data;
        control.divName = "#chart";

        control.options = $.extend({
            stackHeight : 12,
            radius : 1,
            fontSize : 14,
            labelFontSize : 8,
            nodeLabel : null,
            markerWidth : 0,
            markerHeight : 0,
            //width : $(control.divName).outerWidth(),
	    width: 1300,
            gap : 1.5,
            nodeResize : "",
            linkDistance : 10,
            charge : -400,
            styleColumn : null,
            styles : null,
            linkName : null,
            nodeFocus: true,
            nodeFocusRadius: 25,
            nodeFocusColor: "black",
            labelOffset: "5",
            gravity: .1,
            height : $(control.divName).outerHeight()
        }, control.data.d3.options);
    
        
        var options = control.options;
        options.gap = options.gap * options.radius;
        control.width = options.width;
        control.height = options.height;
        control.data = control.data.d3.data;
        control.nodes = control.data.nodes;
        control.links = control.data.links;
        control.color = d3.scale.category20();
        control.clickHack = 200;
        organizeData(control);
    
        control.svg = d3.select(control.divName)
            .append("svg:svg")
            .attr("width", control.width)
            .attr("height", control.height)
	    .append("g")
	    .call(d3.behavior.zoom().scaleExtent([1,8]).on("zoom", zoom))
	    .append("g");
        
	control.svg.append("rect")
	    .attr("class","overlay")
	    .attr("width", control.width)
	    .attr("height", control.height)
	    .style("fill", "white");

	function zoom() {
	    control.svg.attr("transform", "translate("+d3.event.translate + ")scale("+d3.event.scale + ")");
    }
    
        // get list of unique values in stylecolumn
        control.linkStyles = [];
        if (control.options.styleColumn) {
         var x;
         for (var i = 0; i < control.links.length; i++) {
          if (control.linkStyles.indexOf( x = control.links[i][control.options.styleColumn].toLowerCase()) == -1)
           control.linkStyles.push(x);
         }
        } 
        else
         control.linkStyles[0] = "defaultMarker";
        
        control.force = d3.layout.force().
            size([control.width, control.height])
            .linkDistance(control.options.linkDistance)
            .charge(control.options.charge)
            .gravity(control.options.gravity);
    
    
       initPromise.resolve(control);
    });
    return initPromise.promise();
}

function getTheData() {
    var dataPromise = getTheRawData();
    var massage = $.Deferred();
    dataPromise.done ( function (data) {
        // need to massage it
        massage.resolve ( dataMassage (data));    
    })
    .fail (function (error) {
        console.log (error);
        massage.reject(error);
    });

    return massage.promise();
}

function dataMassage(data) {
    //some basic options

    var options = { radius:2.5, nodeLabel:"label", 
                    nodeResize:"count", gravity:.7, charge:-180, linkDistance:10, height:1000,
                    nodeFocus:true}, nodes =[] ,links = [];
    /*
    // simple linking tag to name
    for ( var i=0;i<data.data.length;i++) {
        for ( var j=0; j < data.data[i].tags.tagmap.length ; j++ ) {
            var c =0;
            for ( var k = 0 ; k < data.data[i].tags.tagmap[j].counts.length ; k++) {
                c += data.data[i].tags.tagmap[j].counts[k];
            }
            if (c) {
                // we have an interesting link - store it
                var node = 
                    {   name: data.data[i].key, 
                        count: c,
                        group: data.data[i].tags.tagmap[j].name,
                        linkCount: 0,
                        label: data.data[i].title,
                        shortName: data.data[i].name,
                        url:data.data[i].url 
                    };
                var sk = findOrAddNode (node, nodes);
                var node = 
                    {   name: data.data[i].tags.tagmap[j].name,
                        count: c,
                        group: data.data[i].tags.tagmap[j].name,
                        linkCount: 0,
                        label: data.data[i].tags.tagmap[j].name,
                        shortName: data.data[i].tags.tagmap[j].name,
                        url:data.data[i].url 
                    };
                var tk = findOrAddNode (node, nodes);
                links.push ( { source: sk, target: tk, depth:1, linkName: nodes[sk].url });
            }    
        }
    }
    */
    for (var i = 0; i<data.nodes.length; i++){
	nodes.push(data.nodes[i]);
    }
    
    for (var j = 0; j<data.links.length; j++){
	links.push(data.links[j]);
    }

    console.log("Options: ", options)
    return { d3: { options : options , data : { nodes: nodes, links: links } }};
}


function findOrAddNode(node,nodes) {
    node.linkCount++;
    for ( var i=0;i<nodes.length;i++) {
        if ( nodes[i].name === node.name ) { 
            nodes[i].count += node.count;
            return i;
        }
    }    
    // no match
    return nodes.push(node) - 1 ;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// modify with your proxy and dataurl
// take the raw data and prepare it for d3
function getTheRawData() {
    // here's a php proxy to make jsonP
    var proxyUrl = "http://xliberation.com/s/proxyphp.php";
    // 0B92ExLh4POiZOFlZZ2tsZTh1SEk - blog only
    // 0B92ExLh4POiZNkhMaTJ5c1FDck0 - both
    // 0B92ExLh4POiZTFgwcWtXUG1qVU0 - site
    var fileid = getParameterByName('data') || '0B92ExLh4POiZTFgwcWtXUG1qVU0';
    
    var dataUrl = "https://googledrive.com/host/" + fileid;   
    // promise will be resolved when done
    return getPromiseData(dataUrl,proxyUrl);
}

// no need to touch this
// general deferred handler for getting json data through proxy and creating promise
function getPromiseData(url,proxyUrl){
    /* This is the original javascript
    var deferred = $.Deferred();
    var u = proxyUrl+"?url="+encodeURIComponent(url);

    $.getJSON(u, null, 
        function (data) {
            deferred.resolve(data);
    })
    .error(function(res, status, err) {
        deferred.reject("error " + err + " for " + url);
    });

    return deferred.promise();
    */

    // This should do the same thing for the local JSON file
    var deferred = $.Deferred();

    $.getJSON("try_this_2.json", function(data) {
	deferred.resolve(data)
    });

    return deferred.promise();
}

function zoom(control) {
	control.svg.attr("transform", "translate("+d3.event.translate + ")scale("+d3.event.scale + ")");
    }
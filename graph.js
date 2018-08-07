// console.log(nodes);
// console.log(actions);

// var add_new_action = false;

let graph = function(dom_svg, base_x, base_y, node_radius)
{

  let svg = d3.select(dom_svg);
  let rect = dom_svg.getBoundingClientRect();
  let width = rect.width;
  let height = rect.height;
  console.log(width, height);

  let shift_x = width / 100 * base_x;
  let shift_y = height / 100 * base_y;

  // let color = d3.scaleOrdinal(d3.schemeCategory20);


  let simulation = d3.forceSimulation()
    .force('collision', d3.forceCollide().radius(node_radius * 1.5))
    .force('x', d3.forceX(0).strength(0.1))
    .force('y', d3.forceY().strength(function(d) {
      if (d.depth)
      {
        return 0.15;
      }
      return 0;
    })
      .y(function(d) {
      return d.depth * 30;
    }));

  // graph containers
  let node_g = svg.append("g")
      .attr("class", "nodes");
  let link_g = svg.append("g")
      .attr("class", "links");


  let node = node_g
      .selectAll("circle");

  let link = link_g
      .selectAll("line")

  // background drag 
  let shift_old = {x:0, y:0};
  function svg_dragstarted(d) {
    shift_old.x = shift_x - d3.event.subject.x;
    shift_old.y = shift_y - d3.event.subject.y;
  }
  function svg_dragged(d) {
    shift_x = shift_old.x + d3.event.x;
    shift_y = shift_old.y + d3.event.y;
  }
  svg.call(d3.drag()
      .on("start", svg_dragstarted)
      .on("drag", svg_dragged));

  let nodes_copy = [];
  let links_copy = [];
  let tackts = 5;

function node_dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function node_dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function node_dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0).restart();
  d.fx = null;
  d.fy = null;
}

  function ticked() {
    link
        .attr("x1", function(d) { return d["source"].x + shift_x; })
        .attr("y1", function(d) { return d["source"].y + shift_y; })
        .attr("x2", function(d) { return d["target"].x + shift_x; })
        .attr("y2", function(d) { return d["target"].y + shift_y; })

        .style("stroke-dasharray", function(d) { 
          let dx = d["source"].x - d["target"].x; 
          let dy = d["source"].y - d["target"].y; 
          return Math.sqrt(dx*dx+dy*dy) - node_radius * 2; });
    // console.log(node);
    // if (tackts-- <= 0)
    // {
      // return;
    // }
    // console.log(JSON.stringify(node));
    node
      .attr("cx", function(d) { return d.x + shift_x; })
      .attr("cy", function(d) { return d.y + shift_y; });

  }
  return {
    sync:function(nodes, links)
    {
      nodes_copy = []
      for (let i = 0; i < nodes.length; i++) { 
        let cur_node = nodes[i];
        let new_node = {"depth":0, "id": cur_node["id"]};
        if ("depth" in cur_node)
        {
          new_node["depth"] = cur_node["depth"];
        }
        nodes_copy.push(new_node);
      }
      links_copy = []
      for (let i = 0; i < links.length; i++) { 
        let cur_link = links[i];
        links_copy.push({"source":cur_link["from"], "target":cur_link["to"]});
      }

    console.log("syncGraph start", nodes_copy, links_copy);
    link = link_g
      .selectAll("line")
      .data(links_copy);

    link.exit().remove();

    // links_actual = 
    link = link
      // .style("stroke-width", function(d) { return 2 + d.current * 3; })
      // .style("stroke", function(d) { if(d.passed) {return "#5C5";}return "#777"; })
      .enter().append("line")
        .style("stroke", "#000")//function(d) { if(d.passed) {return "#5C5";}return "#777"; })
        .style("stroke-opacity", 0.7)
        .style("stroke-width", 2)
        .style("stroke-dashoffset", -node_radius)
        .style("stroke-dasharray", 0)
        .style("marker-end", 'url(#head)')
        // .style("stroke-width", function(d) { return 2 + d.current * 3; });
    // links_actual._groups[0] = links_actual._groups[0].concat(link._groups[0]);
    .merge(link);

    node = node_g
      .selectAll("circle")
      .data(nodes_copy);

    node.exit().remove();
    // nodes_actual = 
    node = node
      // .attr("fill", function(d) { return color(d.depth); }) 
      // .style("stroke-width", function(d) { return 1 + d.current * 4; })
      // .style("stroke", function(d) { return d.current ? "#A00" : "#222"; })
      .enter().append("circle")
        // .attr("fill", function(d) { return color(d.depth); }) 
        // .style("stroke-width", function(d) { return 1 + d.current * 4; })
        .attr("r", node_radius)
        // .style("stroke", function(d) { return d.current ? "#A00" : "#222"; })
        // .on('click', function(d,i){ node_clicked(d); })
        .call(d3.drag()
            .on("start", node_dragstarted)
            .on("drag", node_dragged)
            .on("end", node_dragended))

// node 
    // node.enter().
    .merge(node)
        // .attr("cx", 1)
        // .attr("cy", 1);


    // node
    //     .attr("cx", 1)
    //     .attr("cy", 1);
    simulation
        .nodes(nodes_copy)
        .on("tick", ticked);


    simulation.force("link", d3.forceLink(links_copy).strength(0.05).id(function(d){return d.id;}))
    simulation.alphaTarget(0.3).restart();
    // simulation.force("link")
    //     .links(actions);
    

    console.log("syncGraph end");

    }
  }
}

// let svg = d3.select("svg");
// //     // width = +svg.attr("width"),
// //     // height = +svg.attr("height");
// //     // width = +svg.attr("offsetWidth"),
// //     // height = +svg.attr("offsetWidth");
// //     // console.log(svg._groups[0][0]);
// //     // console.log(svg._groups[0][0].offsetWidth);
// let rect = svg.node().getBoundingClientRect();
// let width = rect.width;
// let height = rect.height;
// console.log(width, height);

// //     // console.log(document.getElementById('svg').offsetWidth);
// //     // console.log(document.getElementById('svg').getBoundingClientRect());

// let shift_x = width / 100 * 50;
// let shift_y = height / 100 * 20;

// let color = d3.scaleOrdinal(d3.schemeCategory20);

// let simulation = d3.forceSimulation()
// //     // .force("link", d3.forceLink().links(actions))
// //     // .force("push", d3.forceManyBody().strength(10))
//     .force('collision', d3.forceCollide().radius(15))
// //   //   function(d) {
// //   //   return d.radius
// //   // }))
// //     // .force("center", d3.forceCenter(width / 2, height / 2));
//     .force('x', d3.forceX(0).strength(0.1))
//     .force('y', d3.forceY().strength(function(d) {
//       if (d.depth)
//       {
//         return 0.15;
//       }
//       return 0;
//     })
//       .y(function(d) {
//       return d.depth * 30;
//     }))

// // d3.json("miserables.json", function(error, graph) {
// //   if (error) throw error;

//   let link_g = svg.append("g")
//       .attr("class", "links");
//       // .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

//   let node_g = svg.append("g")
//       .attr("class", "nodes");


// svg.call(d3.drag()
//     .on("start", svg_dragstarted)
//     .on("drag", svg_dragged))

// let shift_old = {x:0, y:0};
// function svg_dragstarted(d) {
//   shift_old.x = shift_x - d3.event.subject.x;
//   shift_old.y = shift_y - d3.event.subject.y;
// }

// function svg_dragged(d) {
//   shift_x = shift_old.x + d3.event.x;
//   shift_y = shift_old.y + d3.event.y;
// }

// let links_actual = [];
// let nodes_actual = [];
// let links_actual2 = [];
// let nodes_actual2 = [];

// function ticked() {
//   // console.log(JSON.stringify(links_actual));
//   // console.log("---===---");
//   // console.log( links_actual._groups.length, links_actual._groups[0].length, 
//   //   nodes_actual._groups.length, nodes_actual._groups[0].length, 
//   //   links_actual2._groups.length, links_actual2._groups[0].length, 
//   //   nodes_actual2._groups.length, nodes_actual2._groups[0].length);
//   // console.log(links_actual.length);
//   // console.log(links_actual._groups.length);
//   // console.log(links_actual._groups[0].length);
//   // console.log(nodes_actual.length);
//   // console.log(nodes_actual._groups.length);
//   // console.log(nodes_actual._groups[0].length);
//   links_actual
//       .attr("x1", function(d) { return d[SOURCE].x + shift_x; })
//       .attr("y1", function(d) { return d[SOURCE].y + shift_y; })
//       .attr("x2", function(d) { return d[DESTINATION].x + shift_x; })
//       .attr("y2", function(d) { return d[DESTINATION].y + shift_y; });

//   nodes_actual
//       .attr("cx", function(d) { return d.x + shift_x; })
//       .attr("cy", function(d) { return d.y + shift_y; });
// }

//   function syncGraph()
//   {
//     console.log("syncGraph start");
//     link = link_g
//       .selectAll("line")
//       .data(actions);

//     link.exit().remove();

//     links_actual = 
//     link
//       .style("stroke-width", function(d) { return 2 + d.current * 3; })
//       .style("stroke", function(d) { if(d.passed) {return "#5C5";}return "#777"; })
//       .enter().append("line")
//         .style("stroke", function(d) { if(d.passed) {return "#5C5";}return "#777"; })
//         .style("stroke-width", function(d) { return 2 + d.current * 3; });
//     links_actual._groups[0] = links_actual._groups[0].concat(link._groups[0]);
//     // links_actual2 = link.merge(link);

//     node = node_g
//       .selectAll("circle")
//       .data(nodes);

//     node.exit().remove();
//     nodes_actual = 
//     node
//       .attr("fill", function(d) { return color(d.depth); }) 
//       .style("stroke-width", function(d) { return 1 + d.current * 4; })
//       .style("stroke", function(d) { return d.current ? "#A00" : "#222"; })
//       .enter().append("circle")
//         .attr("fill", function(d) { return color(d.depth); }) 
//         .style("stroke-width", function(d) { return 1 + d.current * 4; })
//         .attr("r", 5)
//         .style("stroke", function(d) { return d.current ? "#A00" : "#222"; })
//         .on('click', function(d,i){ node_clicked(d); })
//         .call(d3.drag()
//             .on("start", dragstarted)
//             .on("drag", dragged)
//             .on("end", dragended))
//         // .on("mouseover", restartBlur)
//     console.log(nodes_actual._groups[0]);
//     nodes_actual._groups[0] = nodes_actual._groups[0].concat(node._groups[0]);
//     // nodes_actual2 = node._groups + .merge(node)
//     // console.log(r);
//     // console.log("syncGraph");
//     // console.log(link);
//     // console.log(node);
//     // console.log(links_actual);
//     // console.log(nodes_actual);
//     // console.log(links_actual2);
//     // console.log(nodes_actual2);

//     simulation
//         .nodes(nodes)
//         .on("tick", ticked);


//     simulation.force("link", d3.forceLink().links(actions).strength(0.05))
//     simulation.alphaTarget(0.3).restart();
//     // simulation.force("link")
//     //     .links(actions);
    

//     console.log("syncGraph end");

//   }
//   syncGraph();

//   // node.append("title")
//   //     .text(function(d) { return d.title; });

// // });

// function dragstarted(d) {
//   if (!d3.event.active) simulation.alphaTarget(0.3).restart();
//   d.fx = d.x;
//   d.fy = d.y;
// }

// function dragged(d) {
//   d.fx = d3.event.x;
//   d.fy = d3.event.y;
// }

// function dragended(d) {
//   if (!d3.event.active) simulation.alphaTarget(0).restart();
//   d.fx = null;
//   d.fy = null;
// }

// function node_clicked(node)
// {
//   console.log("add_new_action", add_new_action);
//   if(add_new_action)
//   {
//     end_add_new_action(node);
//   }
//   else
//   {
//     renderNode(node);
    
//   }
// }

        w = 1800;
        h = 800;

        var minZoom;
        var maxZoom;

        // Define map projection
        var projection = d3
            .geoEquirectangular()
            .center([0, 15])            // set centre to further North
            .scale([w / (2 * Math.PI)]) // scale to fit group width
            .translate([w / 2, h / 2]); // ensure centred in group

        // Define map path
        var path = d3
            .geoPath()
            .projection(projection)
        ;

        // apply zoom to countriesGroup
        function zoomed() {
            t = d3
                .event
                .transform
            ;
            countriesGroup.attr(
                "transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
            );
        }

        // Define map zoom behaviour
        var zoom = d3
            .zoom()
            .on("zoom", zoomed)
        ;

        function getTextBox(selection) {
            selection.each(function(d) {
                d.bbox = this.getBBox();
            });
        }

        // Function that calculates zoom/pan limits and sets zoom to default value 
        function initiateZoom() {
            // Define a "minzoom" whereby the "Countries" is as small possible without leaving white space at top/bottom or sides
            minZoom = Math.max($("#map-holder").width() / w, $("#map-holder").height() / h);
            // set max zoom to a suitable factor of this value
            maxZoom = 20 * minZoom;
            // set extent of zoom to chosen values
            // set translate extent so that panning can't cause map to move out of viewport
            zoom.scaleExtent([minZoom, maxZoom])
                .translateExtent([[0, 0], [w, h]]);
            // define X and Y offset for centre of map to be shown in centre of holder
            midX = ($("#map-holder").width() - minZoom * w) / 2;
            midY = ($("#map-holder").height() - minZoom * h) / 2;
            // change zoom transform to min zoom and centre offsets
            svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
        }

        // zoom to show a bounding box, with optional additional padding as percentage of box size
        function boxZoom(box, centroid, paddingPerc) {
            minXY = box[0];
            maxXY = box[1];
            // find size of map area defined
            zoomWidth = Math.abs(minXY[0] - maxXY[0]);
            zoomHeight = Math.abs(minXY[1] - maxXY[1]);
            // find midpoint of map area defined
            zoomMidX = centroid[0];
            zoomMidY = centroid[1];
            // increase map area to include padding
            zoomWidth = zoomWidth * (1 + paddingPerc / 100);
            zoomHeight = zoomHeight * (1 + paddingPerc / 100);
            // find scale required for area to fill svg
            maxXscale = $("svg").width() / zoomWidth;
            maxYscale = $("svg").height() / zoomHeight;
            zoomScale = Math.min(maxXscale, maxYscale);
            // handle some edge cases
            // limit to max zoom (handles tiny countries)
            zoomScale = Math.min(zoomScale, maxZoom);
            // limit to min zoom (handles large countries and countries that span the date line)
            zoomScale = Math.max(zoomScale, minZoom);
            // Find screen pixel equivalent once scaled
            offsetX = zoomScale * zoomMidX;
            offsetY = zoomScale * zoomMidY;
            // Find offset to centre, making sure no gap at left or top of holder
            dleft = Math.min(0, $("svg").width() / 2 - offsetX);
            dtop = Math.min(0, $("svg").height() / 2 - offsetY);
            // Make sure no gap at bottom or right of holder
            dleft = Math.max($("svg").width() - w * zoomScale, dleft);
            dtop = Math.max($("svg").height() - h * zoomScale, dtop);
            // set zoom
            svg.transition()
                .duration(700)
                .call(
                    zoom.transform,
                    d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
                );
        }

        // on window resize
        $(window).resize(function() {
            // Resize SVG
            svg.attr("width", $("#map-holder").width())
               .attr("height", $("#map-holder").height());
            // Translate year-text
            yearText
                .attr('transform', "translate(" + ($("#map-holder").width() / 2) + ", " + ($("#map-holder").height() - 50) + ")");
            d3.select("div#slider-years").select("svg")
                .attr("width", $("#map-holder").width() - 30);
            gStep
                .attr("width", $("#map-holder").width());
            legendBoxes
                .attr('transform', function(d, i) {
                    return "translate(50, " + ($("#map-holder").height() - i * 40 - 50) + ")";
                })
            legendTexts
                .attr('transform', function(d, i) {
                    return "translate(90, " + ($("#map-holder").height() - i * 40 - 30) + ")";
                });
            titleText
                .attr('transform', "translate(40, " + ($("#map-holder").height() - 270) + ")");
            initiateZoom();
        });

        var default_year = 2019;
        var rank = "Overall rank";

        //TODO remove
        var detault_year_index = default_year - 1800;
        //TODO remove
        var min_le = 30;
        var max_le = 85;



   function get_country_color(country_var, year, category) {
      if (data[country_var] && data[country_var][year] && data[country_var][year-1]) { 
        actual = data[country_var][year][category];
        epsilon = actual - data[country_var][year-1][category];
        if (category == rank) {

          if (epsilon > 10) {
              return d3.rgb("#003300");
          }
          else if (epsilon < -10 ) {
              return d3.rgb("#D00000");
          }                                                                                                                                         
          else {
            return d3.rgb("#ffad33");
          }
        }
        //pro vsetko ostatne
        else {
          if(epsilon <=0) {
            if (actual/10.0 + epsilon >=0) {
              return d3.rgb("#D00000");
            }
            else {
              return d3.rgb("#003300")
            }
          }
          else {
            if (actual/10.0 - epsilon >=0) {
              return d3.rgb("#ffad33");
            }
            else {
              return d3.rgb("#003300")
            }
          } 
        }
      }
    
      else {
        console.log(country_var)
                  if(year == "2015"){
                    return d3.rgb("#ffad33");
        }
        else {
          return d3.rgb("#B0ABAA")
        }
      }
    }

        var svg = d3
            .select("#map-holder")
            .append("svg")
            .attr("width", $("#map-holder").width())
            .attr("height", $("#map-holder").height())
            .call(zoom);

        var data;
        d3.json(
          "https://raw.githubusercontent.com/halficek/Visualization/master/final.json",
          function(error, json) {
              if (error) throw error;
              data = json
          }
        );

        //TODO remove
        // get life-expectancy data
        var data_le;
        d3.json(
            "https://raw.githubusercontent.com/NoName115/PV251-Visualization/master/life-expectancy.json",
            function(error, json) {
                if (error) throw error;
                data_le = json
            }
        );

        //TODO remove
        // get best-worst le data
        var bar_le;
        d3.json(
            "https://raw.githubusercontent.com/NoName115/PV251-Visualization/master/max-le.json",
            function(error, json) {
                if (error) throw error;
                bar_le = json

                //////////////////////
                // Create barchart
                var chartsvg = d3
                    .select('#country-chart')
                    .append('svg')
                    .attr("width", $("#map-holder").width())
                    .attr("height", 180)
                    .append('g');

                countryBars = chartsvg
                    .selectAll("rect")
                    .data(json[default_year - 1800])
                    .enter()
                    .append("rect")
                    .attr("id", "bar-bars")
                    .attr("x", function(d, i) { return i * 90 + 45 })
                    .attr("y", d => (20 + (120 - 30 - d.le)))
                    .attr("height", d => (30 + d.le))
                    .attr("width", 40)
                    .attr("fill", d => color_scaler(d.le));
    
                counryBarsLabels = chartsvg
                    .append("g")
                    .selectAll("text")
                    .data(json[default_year - 1800])
                    .enter()
                    .append("text")
                    .attr("id", "bar-name")
                    .attr("class", "countryName")
                    .style("text-anchor", "middle")
                    .style("font-size", "20px")
                    .attr("font-weight", 700)
                    .attr("dx", function(d, i) { return i * 90 + 65 })
                    .attr("dy", function(d, i) { return 160 + (i % 2) * 15 })
                    .text(d => d.name)

                countryBarsLe = chartsvg
                    .append("g")
                    .selectAll("text")
                    .data(json[default_year - 1800])
                    .enter()
                    .append("text")
                    .attr("id", "bar-le")
                    .attr("class", "countryName")
                    .style("text-anchor", "middle")
                    .style("font-size", "20px")
                    .attr("font-weight", 700)
                    .attr("dx", function(d, i) { return i * 90 + 65 })
                    .attr("dy", d => (120 - 15 - d.le))
                    .text(d => d.le.toString())
            }
        )

        // get map data
        d3.json(
            "https://raw.githubusercontent.com/halficek/Visualization/master/custom.geo.json",
            function(error, json) {
                if (error) throw error;
                countriesGroup = svg
                    .append("g")
                    .attr("id", "map")
                ;

                // Add a background rectangle
                countriesGroup
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", w)
                    .attr("height", h)
                    .attr("fill", "rgb(49,130,189)")
                ;

                countries = countriesGroup
                    .selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("id", function(d, i) { 
                        return "country" + d.properties.iso_a3;
                    })
                    .attr("class", "country")
                    .attr("fill", d => get_country_color(d.properties.geounit, default_year, rank)) 
                    .attr("active", false)
                    .on("click", function(d, i) {
                        if (d3.select(this).attr("active") == 'true') {
                            d3.select("#countryLabel" + d.properties.iso_a3)
                                .style("display", "none");
                            d3.select(this).attr("active", false);
                            // TODO zoom out
                        }
                        else {
                            d3.select("#countryLabel" + d.properties.iso_a3)
                                .style("display", "block");
                            d3.select(this).attr("active", true);
                            //boxZoom(path.bounds(d), path.centroid(d), 30);
                        }
                    })
                    .on("mouseover", function(d, i) {
                        if (d3.select(this).attr("active") != 'true') {
                            d3.select("#countryLabel" + d.properties.iso_a3)
                                .style("display", "block");
                        }
                    })
                    .on("mouseout", function(d, i) {
                        if (d3.select(this).attr("active") != 'true') {
                            d3.select("#countryLabel" + d.properties.iso_a3)
                                .style("display", "none");
                        }
                    });

                countryLabels = countriesGroup
                    .selectAll("g")
                    .data(json.features)
                    .enter()
                    .append("g")
                    .attr("class", "countryLabel")
                    .attr("id", function(d) {
                        return "countryLabel" + d.properties.iso_a3;
                    })
                    .attr("transform", function(d) {
                        return (
                            "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")"
                        );
                    })
                    // add an onlcick action to zoom into clicked country
                    .on("click", function(d, i) {
                        if (d3.select("#country" + d.properties.iso_a3).attr("active") == 'true') {
                            d3.select(this).style("display", "none");
                            d3.select("#country" + d.properties.iso_a3)
                                .attr("active", false);
                        }
                        else {
                            d3.select(this).style("display", "block");
                            d3.select("#country" + d.properties.iso_a3)
                                .attr("active", true);
                            //boxZoom(path.bounds(d), path.centroid(d), 30);
                        }
                    })
                    .on("mouseover", function(d, i) {
                        if (d3.select("#country" + d.properties.iso_a3).attr("active") != 'true') {
                            d3.select(this).style("display", "block");
                        }
                    })
                    .on("mouseout", function(d, i) {
                        if (d3.select("#country" + d.properties.iso_a3).attr("active")!= 'true') {
                            d3.select(this).style("display", "none");
                        }
                    });

                // add the text to the label group showing country name
                countryLabels
                    .append("text")
                    .attr("class", "countryName")
                    .style("text-anchor", "middle")
                    .attr("dx", 0)
                    .attr("dy", 0)
                    .attr("font-weight", 800)
                    .text(function(d) {
                        country_le_text = "Unavailable";
                        country_le = data_le[d.properties.iso_a3]["le"];
                        if (country_le) {
                            if (country_le[detault_year_index] > 5.0) {
                                country_le_text = country_le[detault_year_index].toString();
                            }
                        }
                        return d.properties.name + " - " + country_le_text;
                    })
                    .call(getTextBox)
                ;
                // add a background rectangle the same size as the text
                countryLabels
                    .insert("rect", "text")
                    .attr("class", "countryLabelBg")
                    .attr("transform", function(d) {
                        return "translate(" + (d.bbox.x - 10) + "," + (d.bbox.y - 5) + ")";
                    })
                    .attr("width", function(d) {
                        return d.bbox.width + 20;
                    })
                    .attr("height", function(d) {
                        return d.bbox.height + 10;
                    })
                ;

                yearText = svg.append("text")
                    .attr("id", "year-text")
                    .attr("class", "countryName")
                    .style("font-size", "60px")
                    .attr("font-weight", 700)
                    .text(default_year.toString())
                    .attr('transform', "translate(" + ($("#map-holder").width() / 2) + ", " + ($("#map-holder").height() - 50) + ")");

                var dataTime = d3.range(0, 215).map(function(d) {
                    return 1800 + d;
                });

                ///////////////////////
                // PRINT LEGEND
                // boxes
                max_range = 5
                legend_data = d3.range(0, max_range + 1).map(function(d) {
                    return min_le + (((max_le - min_le) / max_range) * d);
                });
                boxes = svg
                    .append('g')
                    .attr("id", "legend-boxes")
                    .selectAll("rect")
                    .data(legend_data);
                legendBoxes = boxes
                    .enter()
                    .append("rect")
                    .attr('height', 30)
                    .attr('width', 30)
                    .attr('transform', function(d, i) {
                        return "translate(50, " + ($("#map-holder").height() - i * 40 - 50) + ")";
                    })
                    .attr("style", function (d) {
                        return "fill: " + color_scaler(d) + ";"
                    });
                // text
                legendTexts = d3.select("#legend-boxes")
                    .selectAll("text")
                    .data(legend_data)
                    .enter()
                    .append("text")
                    .attr("class", "countryName")
                    .style("text-anchor", "start")
                    .style("font-size", "16px")
                    .attr("font-weight", 700)
                    .text(function(d) {
                        if (d <= min_le) {
                            return "< " + d.toString() + " years";
                        }
                        else if (d >= max_le) {
                            return "> " + d.toString() + " years";
                        }
                        else {
                            return "~ " + d.toString() + " years";
                        }
                    })
                    .attr('transform', function(d, i) {
                        return "translate(90, " + ($("#map-holder").height() - i * 40 - 30) + ")";
                    });

                titleText = svg.append("text")
                    .attr("id", "year-text")
                    .attr("class", "countryName")
                    .style("font-size", "40px")
                    .attr("font-weight", 700)
                    .text("Average life expectancy")
                    .attr('transform', "translate(40, " + ($("#map-holder").height() - 270) + ")");

                initiateZoom();
            }
        );
        
        //TODO remove
        var year_step = 5;
        var dataTime = d3.range(0, 215).map(function(d) {
            return 1800 + d;
        });



        // Step
        var sliderStep = d3
            .sliderBottom()
            .min(2015)
            .max(2019)
            .width($("#map-holder").width() - 80)
            .tickFormat(d3.format(''))
            .ticks(5)
            .step(1)
            .default(default_year)
            .on('onchange', val => {
                d3.select('#year-text').text(val);
                d3.selectAll('.country')
                    .attr("fill", d => get_country_color(d.properties.geounit, val, rank)); 
                d3.selectAll('.countryLabel').select('text')
                    .text(function(d) {
                        country_le_text = "Unavailable";
                        country_le = data_le[d.properties.iso_a3]["le"];
                        if (country_le) {
                            if (country_le[val - 1800] > 5.0) {
                                country_le_text = country_le[val - 1800].toString();
                            }
                        }
                        return d.properties.name + " - " + country_le_text;
                    });
                d3.selectAll('#bar-bars')
                    .data(bar_le[val - 1800])
                    .attr("y", d => (20 + (120 - 30 - d.le)))
                    .attr("height", d => (30 + d.le))
                    .attr("fill", d => color_scaler(d.le));
                d3.selectAll('#bar-name')
                    .data(bar_le[val - 1800])
                    .text(d => d.name)
                d3.selectAll('#bar-le')
                    .data(bar_le[val - 1800])
                    .attr("dy", d => (120 - 15 - d.le))
                    .text(d => d.le.toString())
            })
            .fill("#000066");

        var gStep = d3
            .select('div#slider-years')
            .append('svg')
            .attr('width', $("#map-holder").width())
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(50, 30)');

        gStep.call(sliderStep);
        d3.select('#year-text').text(sliderStep.value());

        // Set font for all ticks
        d3.selectAll('.tick').select("text")
            .attr("fill", "#000")
            .attr("font-size", 12);

        // Set font for selected tick
        d3.select(".parameter-value").select("text")
            .attr("font-size", 17)
            .attr("fill", "#eee");


    var sliderStep = d3
            .sliderBottom()
            .width($("#map-holder").width() - 80)
            .tickFormat(d3.format(''))
            .ticks(5)
            .step(1)
            .default(default_year)
            .on('onchange', val => {
                //d3.select('#year-text').text(val);
                d3.selectAll('.country')
                    .attr("fill", d => get_country_color(d.properties.geounit, val, rank)); 
                d3.selectAll('.countryLabel').select('text')
                    .text(function(d) {
                        country_le_text = "Unavailable";
                        country_le = data_le[d.properties.iso_a3]["le"];
                        if (country_le) {
                            if (country_le[val - 1800] > 5.0) {
                                country_le_text = country_le[val - 1800].toString();
                            }
                        }
                        return d.properties.name + " - " + country_le_text;
                    });
                d3.selectAll('#bar-bars')
                    .data(bar_le[val - 1800])
                    .attr("y", d => (20 + (120 - 30 - d.le)))
                    .attr("height", d => (30 + d.le))
                    .attr("fill", d => color_scaler(d.le));
                d3.selectAll('#bar-name')
                    .data(bar_le[val - 1800])
                    .text(d => d.name)
                d3.selectAll('#bar-le')
                    .data(bar_le[val - 1800])
                    .attr("dy", d => (120 - 15 - d.le))
                    .text(d => d.le.toString())
            })
            .fill("#000066");

        var gStep = d3
            .select('div#slider-values')
            .append('svg')
            .attr('width', $("#map-holder").width())
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(50, 30)');

        gStep.call(sliderStep);
        d3.select('#year-text').text(sliderStep.value());

        // Set font for all ticks
        d3.selectAll('.tick').select("text")
            .attr("fill", "#000")
            .attr("font-size", 12);

        // Set font for selected tick
        d3.select(".parameter-value").select("text")
            .attr("font-size", 17)
            .attr("fill", "#eee");
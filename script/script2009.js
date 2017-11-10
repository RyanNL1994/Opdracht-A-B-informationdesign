// Bron van code gehaald van de blocks van Mike Foster (stacked barchart with tooltip) https://bl.ocks.org/mjfoster83/7c9bdfd714ab2f2e39dd5c09057a55a0    

// hier wordt een variable svg gemaakt. In deze variabele roept d3 de svg in de html op en wordt de margin voor deze svg bepaald.
var svg = d3.select("svg"),
    margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Hier wordt de X as bepaald van de grafiek
var x = d3.scaleBand()
    .rangeRound([20, width]) // ruimte tussen de x as (waarde as) en de grafiek heb ik veranderd naar 20 inplaats van 0
    .paddingInner(0.15) // witruimte tussen de grafieken in heb ik veranderd naar 0.15 inplaats van 0.5
    .align(0.1);

// Hier wordt de Y as bepaald van de grafiek
var y = d3.scaleLinear()
    .rangeRound([height, 0]);

// Hier worden de kleuren bepaald van de grafiek de orginele kleuren heb ik veranderd naar de kleuren die meer passen binnen mijn huisstijl
var z = d3.scaleOrdinal()
    .range(["#00231E", "#005B4C", "#02967A", "#02C49F", "#00FFCE"]);



// Hier wordt de data wat in mijn CSV bestand zit aangeroepen aan de hand van een functie door d3 en als er iets mis is wordt er een error aangegeven via de if statement. 
// Deze functie zal later op het bij de g.append worden aangeroepen zodat de data van de CSV gereturnd kan worden en de grafiek gemaakt kan worden.
d3.csv("data/data2009.csv", function (d, i, columns) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}, function (error, data) {
    if (error) throw error;

    var keys = data.columns.slice(1);

    data.sort(function (a, b) {
        return b.total - a.total;
    });
    x.domain(data.map(function (d) {
        return d.Vervoersbedrijf; // deze data heb ik veranderd naar vervoersbedrijf dit was eerst State in de oude code
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.total;
    })]).nice();
    z.domain(keys);



    // Hier wordt de data gereturnd van de CSV door de functie uit te voeren die bovenstaand is gemaakt. 
    // Dit geven we aan op zowel de X als Y as en door de data wordt de hoogte van de grafiek bepaald
    // Daarnaast wordt hier ook de tooltip gemaakt aan de hand van een mouseover, mouseout en mousemove de stijl hiervoor kan je op het einde van de code terugvinden
    g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
        .attr("fill", function (d) {
            return z(d.key);
        })
        .selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return x(d.data.Vervoersbedrijf);
        })
        .attr("y", function (d) {
            return y(d[1]);
        })
        .attr("height", function (d) {
            return y(d[0]) - y(d[1]);
        })
        .attr("width", x.bandwidth())
        .on("mouseover", function () {
            tooltip.style("display", null);
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        })
        .on("mousemove", function (d) {
            console.log(d);
            var xPosition = d3.mouse(this)[0] - 5;
            var yPosition = d3.mouse(this)[1] - 5;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d[1] - d[0] + " Miljoen") // naast de data uit de CSV die de tooltip weergeeft heb ik hier de tekst Miljoen aan toegevoegd.
            ;
        })



    // Hier krijgt de groep van de x & y as verschillende attributes en wordt bijv. de , fill, plaatsing van tekst.
    g.append("g")
        .attr("class", "axis")
        .transition().duration(3000) // transition zorgt voor beweging van de tekst op de y as. De tekst gaat omlaag. Duration: van 0 naar 100 in 3000 miliseconden
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("fill", "black") // fill voor de tekst in miljoenen toegevoegd
        .text("in miljoenen OPBRENGSTEN EN BEDRIJFSLATEN IN MILJARDEN") // tekst in miljoenen linksbovenin de grafiek toegevoegd
        .transition().duration(3000) // transition zorgt voor beweging van de tekst op de y as. De tekst gaat omlaag. Duration: van 0 naar 100 in 3000 miliseconden
    ;



    // Hier wordt een variabele legend gemaakt waar we een aantal attributen meegeven voor de legenda zoals de font en font-size.
    // Deze variabele is voor de legenda van de grafiek gemaakt 
    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });



    // Hier wordt aan de hand van de variabele legend de kleuren, breedte en hoogte van de legenda bepaald
    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) {
            return d;
        });
});



// Hier wordt de breedte, hoogte, fill en font-size bepaald voor de tooltip als je over de grafiek hovert
var tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");

tooltip.append("rect")
    .attr("width", 100) // de breedte van de box van de tooltip heb ik veranderd van 60 naar 100
    .attr("height", 20)
    .attr("fill", "white")

tooltip.append("text")
    .attr("x", 50) // de afstand van de tekst van de tooltip van de x as heb ik veranderd van 30 naar 50
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");

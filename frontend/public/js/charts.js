(function ($) {
  $.fn.findByData = function (prop, val) {
    var $self = this;
    if (typeof val === 'undefined') {
      return $self.filter(
        function () { return typeof $(this).data(prop) !== 'undefined'; }
      );
    }
    return $self.filter(
      function () { return $(this).data(prop) == val; }
    );
  };
})(window.jQuery);

$(function() {

  var xaxis = {};
  var yaxis = {};
  var groupby = {};
  var vlSpec;
  var embedSpec;

  $(document).on('click', '.compare-button', function(event) {
    updateVega();
  });

  $(document).on('click', '.chart-toggle', function(event) {
    var show = $(event.target).data('show');
    if (!show) {
      $(event.target).data('show', true);
      $(event.target).html("&#9660;");
      $('.models-container').addClass('models-container-hide');
      $('.chart-container').addClass('chart-container-show');
    } else {
      $(event.target).data('show', false);
      $(event.target).html("&#9650;");
      $('.models-container').removeClass('models-container-hide');
      $('.chart-container').removeClass('chart-container-show');
    }
  });

  function init() {
    var kvs = $('.kv');
    for (var i=0; i<kvs.length; i++) {
      var kv = $(kvs[i]);
      if (kv.data('num')) {
        yaxis[kv.data('key')] = true;
      } else {
        xaxis[kv.data('key')] = true;
        groupby[kv.data('key')] = true;
      }
    }

    for (var key in xaxis) {
      if (xaxis.hasOwnProperty(key)) {
        var option = new Option(key, key);
        $('.x-axis').append(option);
      }
    }

    for (var key in yaxis) {
      if (yaxis.hasOwnProperty(key)) {
        var option = new Option(key, key);
        $('.y-axis').append(option);
      }
    }

    for (var key in groupby) {
      if (groupby.hasOwnProperty(key)) {
        var option = new Option(key, key);
        $('.group-by').append(option);

        // had to re-initialize option b/c
        // otherwise the select was empty
        option = new Option(key, key);
        $('.group-chart').append(option);
      }
    }

    // group-chart default should be none
    $('.group-chart').val('None');

    vegaInit();
  }

  function vegaInit() {
    vlSpec = {
      "data": {
        "values": []
      },
      "mark": "bar",
      "encoding": {
        "column": {
          "type": "nominal",
          "axis": {"orient": "bottom", "axisWidth": 1, "offset": -8}
        },
        "x": {
          "type": "nominal",
          "axis": null
        },
        "y": {
          "aggregate": "average",
          "type": "numeric",
          "axis": {
          }
        },
        "color": {
          "type": "nominal",
        },
        "config": {"facet": {"cell": {"strokeWidth": 0}}}
      }
    };

    embedSpec = {
      mode: "vega-lite",  // Instruct Vega-Embed to use the Vega-Lite compiler
      spec: vlSpec
    };
  }

  function updateVega() {
    var x = $('.x-axis').val();
    var y = $('.y-axis').val();
    var z = $('.group-by').val();

    // update values
    vlSpec.data.values = [];
    var models = $('.model');
    for (var i=0; i<models.length; i++) {
      if ($(models[i]).is(":visible")) {
        var kvs = $(models[i]).find('.kv');
        var xfield = $(kvs.findByData('key', x)[0]);
        var yfield = $(kvs.findByData('key', y)[0]);
        var zfield = $(kvs.findByData('key', z)[0]);
        xfield = xfield.data('val');
        yfield = yfield.data('val');
        zfield = zfield.data('val');
        console.log(zfield);
        if (xfield && yfield && zfield) {
          var val = {};
          val[x] = xfield;
          val[y] = yfield;
          val[z] = zfield;
          vlSpec.data.values.push(val);
        }
      }
    }

    // update axes
    vlSpec.encoding.column.field  = x;
    vlSpec.encoding.y.field = y;
    vlSpec.encoding.column.axis.title = x;
    vlSpec.encoding.y.axis.title = y;
    vlSpec.encoding.x.field = z;
    vlSpec.encoding.color.field = z;

    vg.embed(".model-chart", embedSpec, function(error, result) {
      // Callback receiving the View instance and parsed Vega spec
      // result.view is the View, which resides under the '#Barchart' element
    });
  }

  init();

});
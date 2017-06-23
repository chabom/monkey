// ==UserScript==
// @name         Lazy Portal Recon
// @namespace    https://github.com/chabom
// @version      0.1.7
// @author       chabom
// @match        https://opr.ingress.com/recon
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  var x = function(exp, context) {
    return document.evaluate(exp, context || document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  };

  var custom_view = function() {
    var all_siblings = function(first) {
      var elements = [];
      elements.push(first);

      while (true) {
        var node = elements[elements.length - 1].nextSibling;
        if (!node) {
          elements.push(document.createElement('br'));
          break;
        }
        elements.push(node);
      }
      return elements;
    };

    var form = document.querySelector('#AnswersController form'),
        qualities = all_siblings( x('.//div[1]/div[1]/span[1]', form) ),
        locations = all_siblings( x('.//div[2]/div[1]/div[2]', form) );

    // move elements
    var star_block1 = x('.//div[1]/div[3]', form);
    qualities.forEach(function(quality, i) {
      var ref_node = (i === 0) ? star_block1.firstChild : qualities[i - 1].nextSibling;
      star_block1.insertBefore(quality, ref_node);
    });
    var star_block2 = document.createElement('div');
    locations.forEach(function(location) {
      star_block2.appendChild(location);
    });
    star_block2.appendChild( document.getElementById('submitDiv') );
    star_block1.parentNode.appendChild(star_block2);

    // column size
    document.getElementById('descriptionDiv').classList.remove('col-sm-4');
    document.getElementById('descriptionDiv').classList.add('col-sm-2');
    star_block1.classList.remove('col-sm-4');
    star_block1.classList.remove('pull-right');
    star_block1.classList.add('col-sm-3');
    star_block2.className = 'col-xs-12 col-sm-3 pull-right text-center';

    // disable goToLocation
    document.getElementById('streetViewHeader').removeAttribute('id');
    star_block1.id = 'streetViewHeader';
    document.getElementById('mapViewHeader').removeAttribute('id');
    star_block2.id = 'mapViewHeader';

    // score
    var player_stats = document.querySelector('#player_stats div');
    var scores = [];
    scores.push(x('.//p[2]/span[3]', player_stats).textContent);
    scores.push(x('.//p[3]/span[3]', player_stats).textContent);
    scores.push(x('.//p[4]/span[3]', player_stats).textContent);
    var score_div = document.createElement('div');
    score_div.className = "navbar-text navbar-right";
    score_div.textContent = scores.join(' / ');
    player_stats.parentNode.parentNode.parentNode.appendChild(score_div);
  }();

  var submit_button = document.querySelector('#submitDiv button');
  var stars = Array.prototype.slice.call(document.getElementsByClassName('button-star'));
  var map_reset = document.getElementsByTagName('h4')[1].querySelector('small span');
  var zoom_out, zoom_in;
  var films;
  var film_i = -1;

  // press Enter, 1-5, D/U, M, J/K, H/L, S
  document.addEventListener('keydown', function(e) {
    switch(e.keyCode) {
    case 13: // Enter
      if (submit_button.getAttribute('disabled') !== 'disabled') {
        submit_button.click();
        return;
      }

      var modal = document.getElementsByClassName('modal-body')[0];
      if (modal) {
        var btn = modal.getElementsByTagName('button')[1];
        if (btn) {
          btn.click();
          return;
        }
        var a = modal.querySelector('a[href="/recon"]');
        if (a) { a.click(); }
      }
      break;

    case 49: // 1
      stars[0].click();
      break;
    case 50: // 2
    case 51: // 3
    case 52: // 4
    case 53: // 5
      var num = e.keyCode - 48;
      for (var i = num - 1; i < stars.length; i = i + 5) {
        stars[i].click();
      }
      break;
    case 68: // D
    case 85: // U
      var duplicate = document.querySelector('.mapInfoWindow button');
      if (duplicate) { duplicate.click(); }
      break;
    case 74: // J
      if (!zoom_in) {
        zoom_in = x('.//div/div/div[9]/div[1]/div/div[1]', document.getElementById('map'));
      }
      zoom_in.click();
      break;
    case 75: // K
      if (!zoom_out) {
        zoom_out = x('.//div/div/div[9]/div[1]/div/div[3]', document.getElementById('map'));
      }
      zoom_out.click();
      break;
    case 72: // H
    case 76: // L
      if (!films) { films = document.querySelectorAll('#map-filmstrip li img'); }

      if (e.keyCode === 72) {
        film_i--;
      } else {
        film_i++;
      }
      if (film_i < 0 || film_i >= films.length) { film_i = 0; }
      films[film_i].click();
      break;
    case 77: // M
      map_reset.click();
      film_i = -1;
      break;
    case 83: // S
      document.querySelector('img.gm-fullscreen-control').click();
      break;
    }
  });

})();

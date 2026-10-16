(function(){
  "use strict";
  var $ = function(s){ return document.querySelector(s); };
  var $$ = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var gbp = new Intl.NumberFormat("en-GB", {style:"currency", currency:"GBP", maximumFractionDigits:0});
  var k = function(n){ return "£" + Math.round(n / 1000) + "k"; };
  function paint(r){ r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%"); }

  /* Mobile menu and dropdowns */
  var menuBtn = $("#menuBtn"), links = $("#navlinks");
  if (menuBtn && links){
    menuBtn.addEventListener("click", function(){
      var open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
    });
  }
  $$(".dd").forEach(function(dd){
    var btn = dd.querySelector(".dd-btn");
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var open = !dd.classList.contains("open");
      $$(".dd.open").forEach(function(o){ if (o !== dd){ o.classList.remove("open"); o.querySelector(".dd-btn").setAttribute("aria-expanded", "false"); } });
      dd.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open);
    });
  });
  var desktop = matchMedia("(min-width:961px)");
  document.addEventListener("click", function(e){
    if (desktop.matches && !e.target.closest(".dd")) $$(".dd.open").forEach(function(o){ o.classList.remove("open"); o.querySelector(".dd-btn").setAttribute("aria-expanded", "false"); });
  });
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape") $$(".dd.open").forEach(function(o){ o.classList.remove("open"); o.querySelector(".dd-btn").setAttribute("aria-expanded", "false"); });
  });
  /* Open the current section's dropdown in the mobile menu */
  $$(".dd.is-active").forEach(function(dd){ if (matchMedia("(max-width:960px)").matches){ dd.classList.add("open"); } });

  /* Borrowing calculator */
  var inc1 = $("#inc1"), inc2 = $("#inc2"), dep = $("#dep");
  if (inc1 && inc2 && dep){
    var joint = false;
    var calc = function(){
      [inc1, inc2, dep].forEach(paint);
      var income = +inc1.value + (joint ? +inc2.value : 0);
      var lo = income * 4, hi = income * 4.5, deposit = +dep.value;
      $("#inc1Out").textContent = gbp.format(inc1.value);
      $("#inc2Out").textContent = gbp.format(inc2.value);
      $("#depOut").textContent = gbp.format(deposit);
      $("#borrowRange").textContent = k(lo) + " – " + k(hi);
      var price = hi + deposit;
      $("#budget").textContent = gbp.format(Math.round(price / 1000) * 1000);
      $("#ltv").textContent = price > 0 ? Math.round(hi / price * 100) + "%" : "–";
    };
    [inc1, inc2, dep].forEach(function(r){ r.addEventListener("input", calc); });
    var setJoint = function(v){
      joint = v;
      $("#appSingle").setAttribute("aria-pressed", !v);
      $("#appJoint").setAttribute("aria-pressed", v);
      $("#inc2Field").hidden = !v;
      calc();
    };
    $("#appSingle").addEventListener("click", function(){ setJoint(false); });
    $("#appJoint").addEventListener("click", function(){ setJoint(true); });
    calc();
  }

  /* Repayment calculator */
  var repAmt = $("#repAmt"), repRate = $("#repRate"), repTerm = $("#repTerm");
  if (repAmt && repRate && repTerm){
    var repay = function(){
      [repAmt, repRate, repTerm].forEach(paint);
      var P = +repAmt.value, r = +repRate.value / 100 / 12, n = +repTerm.value * 12;
      var monthly = r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n));
      $("#repAmtOut").textContent = gbp.format(P);
      $("#repRateOut").textContent = (+repRate.value).toFixed(2) + "%";
      $("#repTermOut").textContent = repTerm.value + " years";
      $("#repMonthly").textContent = gbp.format(monthly);
      $("#repIO").textContent = gbp.format(P * r);
      $("#repTotal").textContent = gbp.format(monthly * n - P);
    };
    [repAmt, repRate, repTerm].forEach(function(r){ r.addEventListener("input", repay); });
    repay();
  }

  /* Fixed-rate countdown */
  var mSel = $("#cdMonth"), ySel = $("#cdYear");
  if (mSel && ySel){
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var now = new Date();
    months.forEach(function(m, i){ var o = document.createElement("option"); o.value = i; o.textContent = m; mSel.appendChild(o); });
    for (var y = now.getFullYear(); y <= now.getFullYear() + 5; y++){ var o = document.createElement("option"); o.value = y; o.textContent = y; ySel.appendChild(o); }
    var def = new Date(now.getFullYear(), now.getMonth() + 7, 1);
    mSel.value = def.getMonth(); ySel.value = def.getFullYear();
    var countdown = function(){
      var diff = (+ySel.value - now.getFullYear()) * 12 + (+mSel.value - now.getMonth());
      var st = $("#cdStatus"), msg = $("#cdMsg"), cta = $("#cdCta");
      $("#cdNum").textContent = Math.max(diff, 0);
      st.className = "status";
      if (diff <= 0){
        st.classList.add("late"); st.textContent = "Act now";
        msg.textContent = "Your deal has ended or ends this month. You may already be on a standard rate. Let's get you a new deal.";
        cta.textContent = "Get me off the standard rate";
      } else if (diff <= 6){
        st.classList.add("warn"); st.textContent = "Window open";
        msg.textContent = (diff === 1 ? "Month" : "Months") + " left. You can secure a new rate today, and we'll keep watching rates in case they fall.";
        cta.textContent = "Secure my new rate";
      } else {
        st.textContent = "Plenty of time";
        msg.textContent = "Months until your deal ends. We'll get in touch when your six-month window opens.";
        cta.textContent = "Remind me when it's time";
      }
      var pos = Math.min(Math.max((12 - diff) / 12, 0), 1) * 100;
      $("#tlNow").style.left = "calc(" + pos + "% - 1px)";
      $("#tlWindow").style.left = "50%"; $("#tlWindow").style.right = "0";
    };
    mSel.addEventListener("change", countdown); ySel.addEventListener("change", countdown);
    countdown();
  }

  /* Reviews (verbatim excerpts from Google) */
  var reviews = [
    ["George Robinson", "They gave us quality, trusted advice at every step of the process."],
    ["Justyn Moore", "Mark's communication was excellent and in no way excessive."],
    ["Sam Cooper", "Very helpful and found us a great deal on our mortgage!"],
    ["Alisha Shepherd", "So professional, diligent and knowledgeable."],
    ["Tristan Ware", "They are responsive, proactive and really know their stuff."],
    ["Anna Foster-Ford", "What seemed impossible to us was just another day at the office for them."],
    ["Ellie Caldwell", "Super helpful team who helped explain everything."],
    ["Pauly Blunden", "Professional, knowledgeable, flexible, understanding."]
  ];
  function card(r, hidden){
    var initials = r[0].split(" ").map(function(w){ return w[0]; }).join("").slice(0, 2);
    return '<article class="review"' + (hidden ? ' aria-hidden="true"' : '') + '><span class="stars" aria-label="5 stars">★★★★★</span><p>“' + r[1] + '”</p><footer><span class="av">' + initials + '</span>' + r[0] + '<span class="g">Google</span></footer></article>';
  }
  if ($("#track1")){
    var a = reviews.slice(0, 4), b = reviews.slice(4);
    $("#track1").innerHTML = a.concat(a).map(function(r, i){ return card(r, i >= a.length); }).join("");
    $("#track2").innerHTML = b.concat(b).map(function(r, i){ return card(r, i >= b.length); }).join("");
  }
  if ($("#reviewGrid")){
    $("#reviewGrid").innerHTML = reviews.map(function(r){ return card(r, false); }).join("");
  }

  /* Validation helpers */
  var isPhone = function(v){ return /^(\+44|0)\d{9,10}$/.test(v.replace(/\s/g, "")); };
  var isEmail = function(v){ return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()); };

  /* Enquiry wizard */
  var form = $("#wizard");
  if (form){
    var step = 1, err = $("#err");
    var steps = form.querySelectorAll(".wstep"), bars = form.querySelectorAll(".progress i");
    var show = function(n){
      step = n;
      Array.prototype.forEach.call(steps, function(s){ s.hidden = +s.dataset.step !== n; });
      Array.prototype.forEach.call(bars, function(b, i){ b.classList.toggle("on", i < n); });
      $("#back").hidden = n === 1;
      $("#next").innerHTML = n === 3 ? "Request my call back" : 'Continue <svg aria-hidden="true"><use href="#i-arrow"/></svg>';
      if (n === 3){
        var g = form.querySelector("input[name=goal]:checked"), w = form.querySelector("input[name=when]:checked");
        $("#summary").textContent = (g ? g.value : "") + (w ? " · " + w.value.toLowerCase() : "") + ". We'll call you back today.";
      }
      err.textContent = "";
    };
    var goal = new URLSearchParams(location.search).get("goal");
    if (goal){
      var el = form.querySelector('input[name=goal][value="' + goal.replace(/"/g, "") + '"]');
      if (el){ el.checked = true; show(2); }
    }
    $("#back").addEventListener("click", function(){ show(step - 1); });
    form.addEventListener("submit", function(e){
      e.preventDefault();
      if (step === 1 && !form.querySelector("input[name=goal]:checked")){ err.textContent = "Choose what you need help with to continue."; return; }
      if (step === 2 && !form.querySelector("input[name=when]:checked")){ err.textContent = "Choose a timeframe to continue."; return; }
      if (step < 3){ show(step + 1); return; }
      if (!$("#fName").value.trim()){ err.textContent = "Enter your name so Mark knows who he's calling."; return; }
      if (!isPhone($("#fPhone").value)){ err.textContent = "Enter a UK phone number, for example 07700 900123."; return; }
      if (!isEmail($("#fEmail").value)){ err.textContent = "Enter an email address like name@example.com."; return; }
      if (!$("#fConsent").checked){ err.textContent = "Tick the box so we're allowed to contact you."; return; }
      /* Hook point: POST to Pipedrive web form / CRM here. */
      Array.prototype.forEach.call(steps, function(s){ s.hidden = true; });
      $("#formNav").hidden = true; err.textContent = "";
      Array.prototype.forEach.call(bars, function(b){ b.classList.add("on"); });
      $("#done").hidden = false;
    });
  }

  /* Referral form */
  var refer = $("#referForm");
  if (refer){
    refer.addEventListener("submit", function(e){
      e.preventDefault();
      var rErr = $("#rErr");
      if (!$("#rYourName").value.trim()){ rErr.textContent = "Enter your name so we know who to thank."; return; }
      if (!isEmail($("#rYourEmail").value)){ rErr.textContent = "Enter your email so we can send your voucher."; return; }
      if (!$("#rFriendName").value.trim()){ rErr.textContent = "Enter your friend's name."; return; }
      if (!isPhone($("#rFriendPhone").value)){ rErr.textContent = "Enter your friend's UK phone number."; return; }
      if (!$("#rConsent").checked){ rErr.textContent = "Please confirm your friend is happy to be contacted."; return; }
      /* Hook point: POST referral to CRM here. */
      Array.prototype.forEach.call(refer.children, function(c){ if (c.id !== "rDone") c.hidden = true; });
      $("#rDone").hidden = false;
    });
  }

  /* Award laurel leaves */
  var g = document.getElementById("leaves");
  if (g){
    var svgNS = "http://www.w3.org/2000/svg";
    for (var side = -1; side <= 1; side += 2){
      for (var i = 0; i < 10; i++){
        var deg = 100 + i * 14, th = deg * Math.PI / 180, r = 94;
        var x = side < 0 ? 130 + Math.cos(th) * r : 130 - Math.cos(th) * r, yy = 130 + Math.sin(th) * r;
        var e = document.createElementNS(svgNS, "ellipse"), sz = 1 - i * 0.04;
        e.setAttribute("cx", x.toFixed(1)); e.setAttribute("cy", yy.toFixed(1));
        e.setAttribute("rx", (4.6 * sz).toFixed(1)); e.setAttribute("ry", (11 * sz).toFixed(1));
        var rot = side < 0 ? deg + 25 : 180 - deg - 25;
        e.setAttribute("transform", "rotate(" + rot.toFixed(1) + " " + x.toFixed(1) + " " + yy.toFixed(1) + ")");
        g.appendChild(e);
      }
    }
  }

  /* Reveal on scroll (content stays visible if unsupported) */
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    $$(".reveal").forEach(function(el){ if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in"); });
    document.documentElement.classList.add("js");
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }); }, {rootMargin:"0px 0px -8% 0px"});
    $$(".reveal").forEach(function(el){ io.observe(el); });
    setTimeout(function(){ $$(".reveal").forEach(function(el){ el.classList.add("in"); }); }, 2500);
  }
  var yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();
})();

VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
var div = document.getElementById("boo")
var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

// Configure the rendering context.
renderer.resize(500, 500);
var context = renderer.getContext();
context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

// Create a stave of width 400 at position 10, 40 on the canvas.
var stave = new VF.Stave(10, 50, 200);

// Add a clef and time signature.
stave.addClef("treble");
stave.setEndBarType(VF.Barline.type.SIMPLE);
stave.setContext(context).draw();
var notesBar1 = [
        new VF.StaveNote({ keys: ['C#/1'], duration: 'q' }),
        new VF.StaveNote({ keys: ['d/4'], duration: 'q' }),
        new VF.StaveNote({ keys: ['b#/4'], duration: 'qr' }),
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
    ];
VF.Formatter.FormatAndDraw(context, stave, notesBar1);

var staveBar2 = new VF.Stave(stave.width + stave.x, stave.y, 200);
staveBar2.setEndBarType(VF.Barline.type.END);
staveBar2.setContext(context).draw();

var notesBar2 = [
        new VF.StaveNote({ keys: ['c/4'], duration: 'q' }),
        new VF.StaveNote({ keys: ['d/4'], duration: 'q' }),
        new VF.StaveNote({ keys: ['b/4'], duration: 'qr' }),
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
    ];
        
 VF.Formatter.FormatAndDraw(context, staveBar2, notesBar2);
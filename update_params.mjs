import fs from 'fs';
const f = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/shapeParams.ts';
let code = fs.readFileSync(f, 'utf8');

const target = "  tower: { label: \"Guard Tower\", params: [ {id:\"radius\",label:\"Radius\",val:5,min:2,max:20,step:1}, {id:\"height\",label:\"Height\",val:15,min:4,max:50,step:1}, {id:\"rings\",label:\"Rings\",val:3,min:1,max:10,step:1}, {id:\"points\",label:\"Vertices\",val:8,min:3,max:16,step:1} ] },";

if (code.includes('tower: { label')) {
  const injection = `
  eiffel_tower: { label: "Eiffel Tower", params: [ {id:"width",label:"Base Size",val:60,min:20,max:120,step:5}, {id:"height",label:"Total Height",val:120,min:30,max:250,step:10} ] },
  cyberpunk_nexus: { label: "Cyberpunk Nexus", params: [ {id:"width",label:"City Width",val:50,min:20,max:150,step:5}, {id:"height",label:"Tower Height",val:100,min:30,max:250,step:10} ] },
  castle_keep: { label: "Castle Keep", params: [ {id:"width",label:"Keep Width",val:40,min:10,max:100,step:5}, {id:"height",label:"Wall Height",val:20,min:5,max:60,step:5} ] },
`;
  code = code.replace(target, target + injection);
  fs.writeFileSync(f, code);
  console.log("Injected shape params");
} else {
  console.log("Could not find tower target");
}

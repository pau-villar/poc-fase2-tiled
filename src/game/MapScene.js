import Phaser from 'phaser';

export class MapScene extends Phaser.Scene {
  constructor() { super('MapScene'); }

  // 1. PRELOAD: Vite serveix la carpeta public/ des de l'arrel '/'
  preload() {
    // [NOU] Si alguna càrrega falla, mostra la URL exacta que ha fallat
    this.load.on('loaderror', (f) => console.error('No s\'ha pogut carregar:', f.src));

    this.load.image('tiles_oficina', '/assets/tileset.png');       // Clau interna 'tiles_oficina'
    this.load.image('tiles_muebles', '/assets/muebles.png');       // [NOU] Clau interna 'tiles_muebles'
    this.load.tilemapTiledJSON('mapa_oficina', '/assets/mapa.json'); // Clau interna 'mapa_oficina'
  }

  // 2. CREATE: construïm el mapa i pintem les capes en ordre (de baix a dalt)
  create() {
    const map = this.make.tilemap({ key: 'mapa_oficina' });
    // 1r arg: nom exacte del tileset DINS de Tiled | 2n arg: clau de this.load.image()
    // [CANVI] Ara registrem els DOS tilesets del mapa
    const tsOficina = map.addTilesetImage('tileset_tiled', 'tiles_oficina');
    const tsMuebles = map.addTilesetImage('muebles', 'tiles_muebles');
    if (!tsOficina || !tsMuebles) { console.error('Error: revisa el nom dels tilesets (tileset_tiled / muebles)'); return; }
    const tilesets = [tsOficina, tsMuebles];

    // Creem les capes de rajoles amb el nom exacte que tenen a Tiled
    // L'ordre de creació és l'ordre de dibuix: l'última queda a dalt
    map.createLayer('Terra', tilesets, 0, 0);                      // 1. sòl
    map.createLayer('Mobles', tilesets, 0, 0);                     // [NOU] 2. mobles (damunt el terra)
    const capaParets = map.createLayer('Parets', tilesets, 0, 0);  // 3. parets

    // Deixem activades les col·lisions de paret per aprofitar-les a la Fase 3
    // [CANVI] Col·lisió amb tots els tiles no buits de la capa
    capaParets?.setCollisionByExclusion([-1, 0]);
        
    // [NOU] Llegim la capa d'objectes 'Objectes' definida a Tiled
     const capaObjectes = map.getObjectLayer('Objectes');
     const elementsDetectats = []; // [NOU] Llista per enviar a Vue en acabar el bucle
     capaObjectes?.objects.forEach((obj) => {
       const props = this.obtenirPropietats(obj); // Converteix [{name,value}] -> {clau: valor}
       // Tiled dona (x, y) a dalt a l'esquerra; sumem la meitat per trobar el centre
       const cx = obj.x + (obj.width || 0) / 2;
       const cy = obj.y + (obj.height || 0) / 2;
 
       if (props.tipus === 'spawn') { // Col·loquem l'avatar al punt d'aparició
         this.avatar = this.add.circle(cx, cy, 14, 0x10b981).setStrokeStyle(2, 0xffffff);
       }

       // [NOU] Si és una sala de reunions, dibuixem un rectangle semitransparent i el nom
        if (props.tipus === 'zona') {
         this.add.rectangle(cx, cy, obj.width, obj.height, 0x10b981, 0.22).setStrokeStyle(2, 0x10b981);
         this.add.text(cx, cy, props.nomSala || 'Zona', { fontSize: '13px', color: '#a7f3d0' }).setOrigin(0.5);
         elementsDetectats.push({ tipus: 'Zona', nom: props.nomSala || 'Sense nom', aforament: props.aforament || 0 });
       }
       
       // [NOU] Si és un monitor, dibuixem una icona de pantalla i el seu títol
       if (props.tipus === 'monitor') {
         this.add.rectangle(cx, cy, 28, 20, 0xf59e0b).setStrokeStyle(2, 0xffffff);
         this.add.text(cx, cy - 18, props.titol || 'Monitor', { fontSize: '12px', color: '#fde68a' }).setOrigin(0.5);
         elementsDetectats.push({ tipus: 'Monitor', nom: props.titol || 'Pantalla' });
       }
      });
     // [NOU] Emetem un esdeveniment global del joc perquè PhaserCanvas.vue el rebi
     this.game.events.emit('mapa-carregat', elementsDetectats);
    }

   // [NOU] Mètode auxiliar DINS de class MapScene per llegir Custom Properties de Tiled
   obtenirPropietats(obj) {
     const resultat = {};
     (obj.properties || []).forEach((p) => { resultat[p.name] = p.value; });
     return resultat;
  }
}
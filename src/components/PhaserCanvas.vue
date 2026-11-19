<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Phaser from 'phaser';
import { MapScene } from '../game/MapScene';

// Declarem l'esdeveniment que emetrem cap al component pare (App.vue)
const emit = defineEmits(['mapaCarregat']);
const contenidor = ref(null);
let game = null;

onMounted(() => {
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 640, height: 480,    // Mida exacta de 20x15 rajoles de 32x32 px
    backgroundColor: '#0f172a',
    pixelArt: true,             // Evita vores borroses entre rajoles (Phaser 4)
    parent: contenidor.value,
    scene: [MapScene]
  });

  // Escoltem l'esdeveniment emès des de MapScene.create() i el passem a App.vue
  game.events.on('mapa-carregat', (elements) => {
    emit('mapaCarregat', elements);
  });
});

onUnmounted(() => game?.destroy(true));
</script>
<template><div ref="contenidor"></div></template>

<script setup>
import { ref } from 'vue';
import PhaserCanvas from './components/PhaserCanvas.vue';

// Aquí guardarem la llista de zones i monitors que Phaser ha llegit del JSON
const elementsMapa = ref([]);
</script>

<template>
  <main style="display: flex; gap: 20px; padding: 20px; font-family: sans-serif;">
    <!-- Columna esquerra: llenç 640x480 de Phaser 4 amb el mapa de Tiled -->
    <PhaserCanvas @mapa-carregat="elementsMapa = $event" />

    <!-- Columna dreta: panell HTML generat dinàmicament des de les dades de Tiled -->
    <aside style="min-width: 260px; background: #1e293b; color: white; padding: 16px; border-radius: 10px;">
      <h3>Objectes del Mapa (Tiled)</h3>
      <p v-if="elementsMapa.length === 0">Carregant capa Objectes...</p>
      <ul style="text-align: left;">
        <li v-for="(el, i) in elementsMapa" :key="i" style="margin-bottom: 8px;">
          <strong>[{{ el.tipus }}]</strong> {{ el.nom }}
          <span v-if="el.tipus === 'Zona' && el.aforament > 0" style="color: #a7f3d0;">
            — Màx. {{ el.aforament }} pers.
          </span>
        </li>
      </ul>
    </aside>
  </main>
</template>

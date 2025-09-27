<!--
  About View - Customer App
  Information about Garbaking restaurant including location, hours, and contact details
-->
<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-2xl">G</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Garbaking</h1>
        <p class="text-gray-600">Restaurant traditionnel ivoirien</p>
      </div>

      <!-- About Content -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">À propos de nous</h2>
        <p class="text-gray-600 leading-relaxed mb-4">
          Garbaking est un restaurant spécialisé dans la cuisine traditionnelle ivoirienne.
          Nous proposons des plats authentiques préparés avec des ingrédients frais et locaux,
          dans le respect des traditions culinaires de la Côte d'Ivoire.
        </p>
        <p class="text-gray-600 leading-relaxed">
          Notre spécialité : l'attiéké accompagné de poisson frais, poulet grillé,
          et nos délicieuses sauces maison. Venez découvrir les saveurs authentiques
          de la cuisine ivoirienne dans un cadre chaleureux et convivial.
        </p>
      </div>

      <!-- Location & Hours -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Informations pratiques</h2>

        <!-- Address -->
        <div class="flex items-start space-x-3 mb-4">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Adresse</h3>
            <p class="text-gray-600">123 Avenue de la République<br>Abidjan, Côte d'Ivoire</p>
          </div>
        </div>

        <!-- Phone -->
        <div class="flex items-start space-x-3 mb-4">
          <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Téléphone</h3>
            <p class="text-gray-600">+225 XX XX XX XX</p>
          </div>
        </div>

        <!-- Hours -->
        <div class="flex items-start space-x-3">
          <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Horaires d'ouverture</h3>
            <div class="text-gray-600 space-y-1">
              <p>Lundi - Vendredi: 11h00 - 22h00</p>
              <p>Samedi - Dimanche: 10h00 - 23h00</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Specialties -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Nos spécialités</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl mb-2">🍚</div>
            <h3 class="font-medium text-gray-900 mb-1">Attiéké</h3>
            <p class="text-sm text-gray-600">Traditionnel accompagné de poisson ou poulet</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl mb-2">🐟</div>
            <h3 class="font-medium text-gray-900 mb-1">Poisson braisé</h3>
            <p class="text-sm text-gray-600">Thon et dorade fraîche grillée</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl mb-2">🍗</div>
            <h3 class="font-medium text-gray-900 mb-1">Poulet DG</h3>
            <p class="text-sm text-gray-600">Poulet aux plantains et légumes</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl mb-2">🥤</div>
            <h3 class="font-medium text-gray-900 mb-1">Bissap</h3>
            <p class="text-sm text-gray-600">Boisson traditionnelle rafraîchissante</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This component is purely presentational, no logic needed
</script>
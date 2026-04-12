const { sequelize, Pharmacy } = require('./src/models');

const samplePharmacies = [
  {
    nom: 'Pharmacie du Plateau',
    adresse: 'Avenue Franchet d\'Esperey, Plateau',
    telephone: '+225 27 20 32 00 00',
    email: 'plateau@pharmacie.ci',
    mot_de_passe: 'Pharma123!',
    horaires: 'Lun-Ven 7h30-21h00, Sam 8h-20h',
    latitude: 5.3167,
    longitude: -4.0167,
    note: 4.5,
  },
  {
    nom: 'Pharmacie Cocody',
    adresse: 'Boulevard Latrille, Cocody',
    telephone: '+225 27 22 44 55 66',
    email: 'cocody@pharmacie.ci',
    mot_de_passe: 'Pharma123!',
    horaires: 'Lun-Sam 8h00-22h00',
    latitude: 5.3515,
    longitude: -3.9870,
    note: 4.8,
  },
  {
    nom: 'Pharmacie de Yopougon',
    adresse: 'Rue Principale, Yopougon Niangon',
    telephone: '+225 27 23 45 67 89',
    email: 'yopougon@pharmacie.ci',
    mot_de_passe: 'Pharma123!',
    horaires: 'Lun-Ven 8h00-20h00',
    latitude: 5.3364,
    longitude: -4.0892,
    note: 4.2,
  },
  {
    nom: 'Pharmacie Adjamé',
    adresse: 'Marché Adjamé, Rue du Commerce',
    telephone: '+225 27 20 11 22 33',
    email: 'adjame@pharmacie.ci',
    mot_de_passe: 'Pharma123!',
    horaires: 'Lun-Sam 7h00-21h00',
    latitude: 5.3533,
    longitude: -4.0233,
    note: 4.0,
  },
  {
    nom: 'Pharmacie Treichville',
    adresse: 'Avenue 7, Treichville',
    telephone: '+225 27 21 33 44 55',
    email: 'treichville@pharmacie.ci',
    mot_de_passe: 'Pharma123!',
    horaires: 'Lun-Dim 8h00-23h00',
    latitude: 5.3000,
    longitude: -4.0000,
    note: 4.6,
  },
  {
    nom: 'Pharmacie Marcory',
    adresse: 'Boulevard de Marseille, Marcory',
    telephone: '+225 27 21 55 66 77',
    email: 'marcory@pharmacie.ci',
    mot_de_passe: 'Pharma123!',
    horaires: 'Lun-Sam 8h00-20h00',
    latitude: 5.2833,
    longitude: -3.9833,
    note: 4.3,
  },
  {
    nom: 'Pharmacie Abobo',
    adresse: 'Carrefour Abobo Baoulé',
    telephone: '+225 27 23 66 77 88',
    email: 'abobo@pharmacie.ci',
    mot_de_passe: 'Pharma123!',
    horaires: 'Lun-Ven 8h00-19h00',
    latitude: 5.4167,
    longitude: -4.0167,
    note: 3.9,
  },
  {
    nom: 'Pharmacie Koumassi',
    adresse: 'Rue des Jardins, Koumassi',
    telephone: '+225 27 21 77 88 99',
    email: 'koumassi@pharmacie.ci',
    mot_de_passe: 'Pharma123!',
    horaires: 'Lun-Sam 8h00-21h00',
    latitude: 5.2917,
    longitude: -3.9500,
    note: 4.1,
  },
];

async function seedPharmacies() {
  try {
    await sequelize.sync({ alter: true });
    console.log('📦 Base de données synchronisée');

    for (const pharmacy of samplePharmacies) {
      const existing = await Pharmacy.findOne({ where: { email: pharmacy.email } });
      if (!existing) {
        await Pharmacy.create(pharmacy);
        console.log(`✅ Ajoutée: ${pharmacy.nom}`);
      } else {
        console.log(`⏭️ Existe déjà: ${pharmacy.nom}`);
      }
    }

    console.log('\n🎉 Seed terminé!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedPharmacies();

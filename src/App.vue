<script setup lang="ts">
import {
  useFirestore,
  useCollection,
  useFirebaseAuth,
  useCurrentUser,
} from "vuefire";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { ref } from "vue";
import {
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import parkImage from "../src/assets/park2.png";
import { watchEffect } from "vue";

const auth = useFirebaseAuth();
const user = useCurrentUser();
console.log("auth?.currentUser", auth?.currentUser);
console.log("user", user.value?.email);

const db = useFirestore();
const spotCollection = useCollection(collection(db, "spots"));

const newSpot = ref({
  name: null,
  type: null,
  address: null,
  rating: 0,
  favourite: false,
});

const newUser = ref({
  email: "",
  password: "",
});

function clearUser() {
  newUser.value = {
    email: "",
    password: "",
  };
}

async function addSpot() {
  const newDoc = await addDoc(collection(db, "spots"), {
    ...newSpot.value,
  });

  if (newDoc.id) {
    newSpot.value = {
      name: null,
      type: null,
      address: null,
      rating: 0,
      favourite: false,
    };
  } else console.log("oops something went wrong");
}

async function deleteSpot(id: string) {
  await deleteDoc(doc(db, "spots", id)).then(() => console.log("hello"));
}

async function createUser() {
  if (auth)
    createUserWithEmailAndPassword(
      auth,
      newUser.value.email,
      newUser.value.password
    )
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        clearUser();
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("errorCode", errorCode);
        console.log("errorMessage", errorMessage);
      });
}

async function signInUser() {
  if (auth)
    signInWithEmailAndPassword(
      auth,
      newUser.value.email,
      newUser.value.password
    )
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        clearUser();
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("errorCode", errorCode);
        console.log("errorMessage", errorMessage);
      });
}

async function signOutOfFirebase() {
  if (auth)
    signOut(auth)
      .then(() => {
        console.log("Logged out!");
      })
      .catch((error) => {
        console.error(error);
      });
}

const spotImages = ref<any>({});

async function fetchRandomDogImage(spotId: string) {
  try {
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();
    spotImages.value[spotId] = data.message;
  } catch (error) {
    console.error("Error fetching random dog image:", error);
  }
}

watchEffect(() => {
  spotCollection.value.forEach((spot) => {
    fetchRandomDogImage(spot.id);
  });
});
</script>

<template>
  <div style="width: 100%">
    <!-- LOGOUT -->
    <div
      v-if="user?.email"
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <div>
        Logged in User: <strong>{{ user?.email }}</strong>
      </div>
      <v-btn variant="text" color="red" @click.prevent="signOutOfFirebase"
        >Sign Out</v-btn
      >
    </div>
    <br />
    <!-- TITLE -->
    <v-card
      class="mx-auto"
      color="surface-variant"
      :image="parkImage"
      subtitle="Visit Adelaide's best spots with your furry friends"
      height="200"
    >
      <template #title>
        <h1>Pup Spots Adelaide</h1>
      </template>
    </v-card>

    <!-- main content -->
    <div style="display: flex; gap: 4rem; width: 100%">
      <!-- Forms -->
      <div style="min-width: 400px; margin-top: 2rem">
        <div v-if="!user?.email">
          <h3>Sign In</h3>
          <br />
          <v-form>
            <v-text-field
              v-model="newUser.email"
              hint="test@test.com"
              type="email"
              label="email"
            ></v-text-field>
            <v-text-field
              v-model="newUser.password"
              hint="password123"
              type="password"
              label="password"
            ></v-text-field>
            <div style="display: flex; gap: 1rem">
              <v-btn color="green" @click.prevent="signInUser">Log in</v-btn>
              <v-btn @click.prevent="createUser">Create User</v-btn>
            </div>
          </v-form>
        </div>
        <div v-else>
          <h3>Add pup spot</h3>
          <br />
          <v-form>
            <v-text-field v-model="newSpot.name" label="Name"></v-text-field>
            <v-text-field v-model="newSpot.type" label="Type"></v-text-field>
            <v-text-field
              v-model="newSpot.address"
              label="Address"
            ></v-text-field>
            <v-text-field
              v-model="newSpot.rating"
              type="number"
              label="Rating"
            ></v-text-field>
            <v-checkbox
              v-model="newSpot.favourite"
              label="Favourite"
            ></v-checkbox>
            <v-btn @click.prevent="addSpot">Add spot</v-btn>
          </v-form>
        </div>
      </div>
      <!-- Spot List -->
      <div style="width: 100%">
        <div
          style="
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 2rem;
          "
        >
          <v-card
            v-for="spot in spotCollection"
            :key="spot.name"
            theme="dark"
            border="1"
            elevation="4"
          >
            <v-img
              v-if="spotImages[spot.id]"
              :src="spotImages[spot.id]"
              height="100"
            />
            <template #title>
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                "
              >
                <div>{{ spot.name }}</div>
                <v-icon
                  v-if="spot.favourite"
                  color="yellow-darken-2"
                  icon="mdi-star"
                ></v-icon>
              </div>
            </template>
            <template #subtitle> {{ spot.type }}</template>

            <template #text>
              Address: {{ spot.address }}
              <br />
              Rating:
              <div style="display: flex; gap: 1rem; align-items: center">
                <v-rating
                  hover
                  readonly
                  :length="5"
                  :size="16"
                  :model-value="spot.rating"
                  active-color="primary"
                />
                <div style="margin-top: 0.5rem">{{ spot.rating }} / 5</div>
              </div>
            </template>

            <v-card-actions v-if="user?.email">
              <v-btn disabled>Edit</v-btn>
              <v-btn
                variant="outlined"
                @click.prevent="() => deleteSpot(spot.id)"
                >Delete</v-btn
              >
            </v-card-actions>
          </v-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

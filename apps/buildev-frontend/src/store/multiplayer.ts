import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth";

export interface CursorPosition {
  x: number;
  y: number;
  userName: string;
  color: string;
}

export const useMultiplayerStore = defineStore("multiplayer", () => {
  const auth = useAuthStore();
  const remoteCursors = ref<Record<string, CursorPosition>>({});
  const userCount = ref(1); // Default to 1 (just me)

  function updateMyPosition(x: number, y: number) {
    if (userCount.value > 1) {
      simulateOthers(x, y);
    } else {
      remoteCursors.value = {};
    }
  }

  function simulateOthers(my_x: number, my_y: number) {
     remoteCursors.value['user_2'] = {
        x: my_x + 100,
        y: my_y + 50,
        userName: "Alex Designer",
        color: "#f43f5e"
     };
     if (userCount.value > 2) {
       remoteCursors.value['user_3'] = {
          x: 400,
          y: 300,
          userName: "Sarah Dev",
          color: "#8b5cf6"
       };
     }
  }

  function setUserCount(count: number) {
    userCount.value = count;
    if (count <= 1) remoteCursors.value = {};
  }

  return { remoteCursors, userCount, updateMyPosition, setUserCount };
});

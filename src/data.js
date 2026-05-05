(function () {
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);

  window.CSHeartDemoData = {
    athletes: [
      {
        id: "ath-1",
        firstName: "Andrei",
        lastName: "Popescu",
        group: "U10",
        parentPhone: "0722 111 222",
        active: true,
        notes: "Preferă aruncările de la semidistanță."
      },
      {
        id: "ath-2",
        firstName: "Mara",
        lastName: "Ionescu",
        group: "U10",
        parentPhone: "0733 222 333",
        active: true,
        notes: "Are nevoie de atenție la gleznă."
      },
      {
        id: "ath-3",
        firstName: "David",
        lastName: "Marin",
        group: "U12",
        parentPhone: "0744 333 444",
        active: true,
        notes: "Căpitan de grupă."
      },
      {
        id: "ath-4",
        firstName: "Sofia",
        lastName: "Dumitru",
        group: "U12",
        parentPhone: "0755 444 555",
        active: false,
        notes: "Pauză temporară."
      },
      {
        id: "ath-5",
        firstName: "Matei",
        lastName: "Stan",
        group: "U14",
        parentPhone: "0766 555 666",
        active: true,
        notes: ""
      }
    ],
    trainings: [
      {
        id: "tr-1",
        date: today,
        group: "U10",
        attendance: {
          "ath-1": "prezent",
          "ath-2": "învoit"
        }
      },
      {
        id: "tr-2",
        date: today,
        group: "U12",
        attendance: {
          "ath-3": "prezent",
          "ath-4": "absent"
        }
      }
    ],
    fees: [
      {
        id: "fee-1",
        athleteId: "ath-1",
        month: currentMonth,
        status: "plătită",
        amountDue: 250,
        amountPaid: 250,
        paymentDate: today,
        method: "transfer",
        notes: ""
      },
      {
        id: "fee-2",
        athleteId: "ath-2",
        month: currentMonth,
        status: "parțial plătită",
        amountDue: 250,
        amountPaid: 100,
        paymentDate: today,
        method: "cash",
        notes: "Rest 150 lei."
      },
      {
        id: "fee-3",
        athleteId: "ath-3",
        month: currentMonth,
        status: "neplătită",
        amountDue: 280,
        amountPaid: 0,
        paymentDate: "",
        method: "transfer",
        notes: ""
      }
    ]
  };
})();

var aggregators = vuetiful.aggregators;
var formatters = vuetiful.formatters;
var currencies = vuetiful.maps.currencies;

var customers = {
    striped: true,
    editable: false,
    lineNumbers: false,
    filter: null,

    currency: "USD",
    dateFormat: "YYYY-MM-DD",
    
    columns: [
        {
            id: "composer",
            label: "Composer",
            width: 3,
            sortable: true,
            groupable: true,
            aggregators: []
        },
        {
            id: "work",
            label: "Work",
            width: 8,
            sortable: true,
            groupable: true,
            aggregators: []
        },
        // {
        //     id: "work_part",
        //     label: "Part",
        //     width: null,
        //     sortable: true,
        //     groupable: true,
        //     aggregators: []
        // },
        {
            id: "recordingDate",
            label: "Date",
            width: 2,
            sortable: true,
            groupable: true,
            aggregators: [
                aggregators.min,
                aggregators.max
            ],
            formatter: function (value) {
                return formatters.datetime(value, customers.dateFormat);
            }
        },
        // {
        //     id: "spotify",
        //     label: " ",
        //     width: 2,
        //     sortable: true,
        //     groupable: true,
        //     aggregators: []
        // },
        {
            id: "listened",
            label: " ",
            width: 1,
            sortable: true,
            groupable: true,
            aggregators: []
        }
    ],

    rows: recordings, 

    selected: []
};

new Vue({
    el: "#datatables",

    data: function () {
        return {
            customers: customers,
            currencies: currencies,
            aggregators: aggregators,
            dateFormats: [
                "DD/MM/YYYY",
                "DD MMM YYYY",
                "D MMMM YYYY",
                "D/MM/YYYY h:mm a"
            ],
            formatters: [
                { id: "C", name: "Currency" },
                { id: "DT", name: "Date and Time" }
            ]
        };
    },

    computed: {

        selectAll: {
            get: function () {
                return customers.selected.length == customers.rows.length;
            },
            set: function (value) {
                customers.selected = value ? customers.rows : [];
            }
        }

    },
    
    methods: {
        markAsListened: function(recording) {
            var index = customers.rows.indexOf(recording);
                
            if (index === -1) {
                return;
            }

            

            customers.rows[index].listened = !customers.rows[index].listened
        }
    },
    
    mounted() {
        listened.forEach(recordingId => {
            const recording = recordings.find(recording => {
                return recording.id === recordingId
            })

            if (recording) recording.listened = true
        })

    }
});
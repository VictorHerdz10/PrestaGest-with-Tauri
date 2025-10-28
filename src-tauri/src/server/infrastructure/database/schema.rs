// @generated automatically by Diesel CLI.

diesel::table! {
    borrowers (id) {
        id -> Integer,
        phone -> Text,
        name -> Text,
        location -> Text,
        total_loans -> Double,
        total_paid -> Double,
        balance -> Double,
        status -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    currencies (id) {
        id -> Integer,
        code -> Text,
        name -> Text,
        exchange_rate -> Float,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    loans (id) {
        id -> Integer,
        amount -> Float,
        currency -> Text,
        status -> Text,
        borrower_id -> Integer,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    payments (id) {
        id -> Integer,
        amount -> Float,
        currency -> Text,
        exchange_rate -> Float,
        amount_cup -> Float,
        borrower_id -> Integer,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    users (id) {
        id -> Integer,
        phone -> Text,
        name -> Text,
        password -> Text,
        role -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::joinable!(loans -> borrowers (borrower_id));
diesel::joinable!(payments -> borrowers (borrower_id));

diesel::allow_tables_to_appear_in_same_query!(borrowers, currencies, loans, payments, users,);

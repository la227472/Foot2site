using Foot2site_V1.Data;
using Foot2site_V1.Modele;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Foot2site_V1.Controllers
{
    [Route("api/wallet")]
    [ApiController]
    public class WalletController : ControllerBase
    {
        private readonly Foot2site_V1Context _context;

        public WalletController(Foot2site_V1Context context)
        {
            _context = context;
        }

        // GET: api/wallet/solde/{userId}
        // Récupérer le solde du portefeuille actuel de l'utilisateur en calculant la somme des transactions
        [HttpGet("solde/{userId}")]
        public ActionResult<decimal> GetSolde(int userId)
        {

            // Vérifier que l'utilisateur existe
            var user = _context.User.Find(userId);
            if (user == null)
            {
                return BadRequest(new { message = "Utilisateur non trouvé" });
            }

            // Charger les transactions depuis la DB, join avec le type de transaction
            var solde = _context.Transaction
                .Where(t => t.Id_User == userId)
                .Join(_context.Type_Operation,
                t => t.Id_TYPE_OPERATION,
                to => to.Id_Type_Operation,
                (t, to) => new { t.Montant_operation, to.Nom_Type_Operation })
                .Sum(x => x.Nom_Type_Operation == "RECHARGE" ? x.Montant_operation : -x.Montant_operation);
            return Ok(solde);
        }


        // POST: api/wallet/recharge
        // Recharger le portefeuille d'un utilisateur aprés l'achat d'un crédit ou une récompense
        [HttpPost("recharge")]
        public async Task<IActionResult> Recharge(int UserId, decimal montant)
        {
            // Vérifier que le user et le montant sont valides
            var user = _context.User.FindAsync(UserId);
            if (user == null || montant <= 0)
            {
                return BadRequest(new { message = "User ou montant invalide" });
            }

            // Récupérer le type de transaction "RECHARGE" ou non
            var typeOperation = _context.Type_Operation
                .FirstOrDefault(to => to.Nom_Type_Operation == "RECHARGE");
            if (typeOperation == null)
            {
                return BadRequest(new { message = "Type d'opération 'RECHARGE' non trouvé" });
            }

            // Création de la transaction de type RECHARGE
            var RechargeTransaction = new Transaction
            {
                Description_transaction = "Recharge de " + montant + "€",
                Montant_operation = montant,
                Id_User = UserId,
                Id_TYPE_OPERATION = typeOperation.Id_Type_Operation

            };

            _context.Transaction.Add(RechargeTransaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSolde), new { userId = UserId }, RechargeTransaction);
        }

        // POST: api/wallet/debit
        // Transaction de type DEBIT pour un achat
        [HttpPost("debit")]
        public async Task<IActionResult> Debit(int UserId, decimal montant)
        {
            // Vérifier que le user et le montant sont valides
            var user = await _context.User.FindAsync(UserId);
            if (user == null || montant <= 0)
            {
                return BadRequest(new { message = "User ou montant invalide" });
            }

            // Récupérer le type de transaction "DEBIT" ou non
            var typeOperation = await _context.Type_Operation
                .FirstOrDefaultAsync(to => to.Nom_Type_Operation == "DEBIT");
            if (typeOperation == null)
                {
                return BadRequest(new { message = "Type d'opération 'DEBIT' non trouvé" });
            }

            // Vérifier que le solde est suffisant
            var solde = await _context.Transaction
                .Where(t => t.Id_User == UserId)
                .Join(_context.Type_Operation,
                t => t.Id_TYPE_OPERATION,
                to => to.Id_Type_Operation,
                (t, to) => new { t.Montant_operation, to.Nom_Type_Operation })
                .SumAsync(x => x.Nom_Type_Operation == "RECHARGE" ? x.Montant_operation : -x.Montant_operation);
            
            if (solde < montant)
            {
                return BadRequest(new { message = "Solde insuffisant" });
            }

            var DebitTransaction = new Transaction
            {
                Description_transaction = "Débit de " + montant + "€",
                Montant_operation = montant,
                Id_User = UserId,
                Id_TYPE_OPERATION = typeOperation.Id_Type_Operation
            };

            _context.Transaction.Add(DebitTransaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSolde), new { userId = UserId }, DebitTransaction);
        }



        // GET : api/wallet/transactions/{userId}
        // Récupérer l'historique des transactions d'un utilisateur
        [HttpGet("transactions/{userId}")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions(int userId)
        {
            // On récupere toutes les transactions de l'utilisateur
            var HistoriqueTransactions = await _context.Transaction
                .Where(t => t.Id_User == userId)
                .OrderByDescending(t => t.Id_Transaction)
                .ToListAsync();

            return Ok(HistoriqueTransactions);
            
        }

        // PUT: api/wallet/transaction/{id}
        // Modifier une transaction par id
        [HttpPut("transaction/{transactionId}")]
        public async Task<IActionResult> PutTransaction(int transactionId, [FromBody] Transaction transaction)
        {
            var transactionSelected = await _context.Transaction.FindAsync(transactionId);
            if (transactionSelected == null)
            {
                return NotFound(new { message = "Transaction non trouvée" });
            }
            if (transaction.Id_Transaction != transactionId)
            {
                return BadRequest(new { message = "L'ID de la transaction ne correspond pas" });
            }

            // Mise à jour des champs modifiables
            transactionSelected.Description_transaction = transaction.Description_transaction;
            transactionSelected.Montant_operation = transaction.Montant_operation;
            transactionSelected.Id_TYPE_OPERATION = transaction.Id_TYPE_OPERATION;
            await _context.SaveChangesAsync();
            return Ok(transactionSelected);

        }

        // DELETE: api/wallet/transaction/{id}
        // Supprimer une transaction par id
        [HttpDelete("transaction/{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var transactionToDelete = await _context.Transaction.FindAsync(id);
            if (transactionToDelete == null)
            {
                return NotFound(new { message = "Transaction non trouvée" });
            }
            _context.Transaction.Remove(transactionToDelete);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Transaction supprimée avec succès" });
        }
    }
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import SimpleNavigation from "@/components/home/navigation/SimpleNavigation";
import Footer from "@/components/home/sections/Footer";

export default function TermsPage() {
  return (
    <>
      <SimpleNavigation />
      <div className="min-h-screen bg-background">

      <main className="pt-20 sm:pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Terms & Conditions of Service
            </h1>
            <p className="text-sm text-muted-foreground font-body mb-8">Last Updated: May 29, 2026</p>

            <div className="prose prose-sm sm:prose-base max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  These Terms and Conditions (the "Terms") constitute a legally binding and enforceable agreement between Westminster Chariots ("Westminster Chariots," "WC," the "Company," "we," "our," or "us") and any individual, corporation, partnership, limited liability company, governmental entity, organization, travel coordinator, executive assistant, agent, representative, or other person or entity that books, arranges, purchases, receives, accesses, or utilizes transportation services (collectively, the "Client," "Passenger," or "you").
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  By requesting, reserving, arranging, purchasing, receiving, accessing, or otherwise utilizing any service offered by Westminster Chariots, you expressly acknowledge and agree that you have read, understood, and voluntarily accepted these Terms and agree to be legally bound by them.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  If you do not agree to these Terms in their entirety, you are not authorized to book, arrange, access, receive, or utilize Westminster Chariots' services. Your continued use of any service provided by Westminster Chariots shall constitute conclusive evidence of your acceptance of these Terms, including any amendments, revisions, modifications, or updates promulgated by the Company from time to time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">2. Services</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Westminster Chariots is a provider of premium luxury chauffeured ground transportation services.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">Services may include, without limitation:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>Airport transfers</li>
                  <li>Corporate transportation</li>
                  <li>Executive transportation</li>
                  <li>Point-to-point transportation</li>
                  <li>Hourly chauffeur services</li>
                  <li>Roadshows</li>
                  <li>Special events</li>
                  <li>Long-distance transportation</li>
                  <li>Group transportation</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  All services are offered subject to vehicle availability, chauffeur availability, operational feasibility, safety considerations, regulatory requirements, and applicable federal, state, and local laws.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  The Company's duties and obligations are expressly limited to the provision of transportation services during the period in which a Passenger is entering, occupying, or exiting a vehicle operated under the direction and control of a Westminster Chariots chauffeur. Under no circumstances shall Westminster Chariots be deemed responsible or liable for any occurrence, incident, injury, loss, damage, dispute, claim, or liability arising before pickup, after drop-off, or outside the confines of the Company's vehicle.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Such exclusion of responsibility includes, without limitation, incidents occurring at airports, hotels, residences, office buildings, event venues, parking facilities, sidewalks, roadways, private property, public spaces, transportation terminals, or any location not owned, operated, or directly controlled by Westminster Chariots.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">3. Affiliate Network Services</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  In order to facilitate uninterrupted service, geographic flexibility, and operational continuity, Westminster Chariots may, in its sole discretion, engage independent affiliate transportation providers, subcontractors, carriers, or transportation partners.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">Where transportation services are performed by an affiliate provider:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>The affiliate shall retain exclusive operational control over the vehicle and chauffeur.</li>
                  <li>The affiliate shall be solely responsible for all operating authority, licensing, permitting, insurance coverage, regulatory compliance, vehicle maintenance, driver qualifications, and legal obligations associated with the transportation service.</li>
                  <li>Westminster Chariots shall function solely as a reservation coordinator, booking intermediary, and administrative facilitator.</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed">
                  To the maximum extent permitted by applicable law, Westminster Chariots expressly disclaims and shall bear no liability whatsoever for the acts, omissions, negligence, gross negligence, misconduct, delays, accidents, injuries, deaths, property damage, service interruptions, regulatory violations, or other conduct of any independent affiliate provider.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">4. Reservations</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Reservations shall not be deemed accepted, confirmed, or guaranteed unless and until expressly confirmed by Westminster Chariots.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">
                  The Company reserves the absolute right, in its sole and reasonable discretion, to refuse, decline, modify, suspend, or cancel any reservation for reasons including, but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>Vehicle availability</li>
                  <li>Safety concerns</li>
                  <li>Operational limitations</li>
                  <li>Payment issues</li>
                  <li>Regulatory requirements</li>
                  <li>Force majeure events</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  The Client warrants that all reservation information provided is accurate, complete, and current.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  The Client shall be solely responsible for any costs, losses, delays, fees, or damages arising from inaccurate, incomplete, misleading, or erroneous reservation information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">5. Pricing and Payment</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">Rates are determined based upon numerous factors, including but not limited to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>Distance</li>
                  <li>Vehicle class</li>
                  <li>Duration</li>
                  <li>Service type</li>
                  <li>Market conditions</li>
                  <li>Special event demand</li>
                  <li>Airport fees</li>
                  <li>Tolls</li>
                  <li>Parking</li>
                  <li>Additional stops</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">Additional charges may be assessed for:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>Waiting time</li>
                  <li>Route deviations</li>
                  <li>Additional passengers</li>
                  <li>Additional luggage</li>
                  <li>Cleaning fees</li>
                  <li>Vehicle damage</li>
                  <li>Requested service extensions</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Unless otherwise agreed in a written instrument executed by the Company, payment shall be due and payable at the time of booking.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  The Client expressly authorizes Westminster Chariots to charge any payment method maintained on file for all authorized charges, fees, expenses, damages, penalties, and other amounts arising in connection with a reservation.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  All transactions are final and non-refundable except where otherwise required by applicable law.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Except as expressly required by law or approved in writing by an authorized representative of Westminster Chariots, the Company shall have no obligation whatsoever to provide refunds, reimbursements, credits, discounts, offsets, abatements, compensation, goodwill payments, or other monetary consideration for any reason, including but not limited to delays, traffic conditions, missed flights, missed appointments, scheduling conflicts, dissatisfaction with service, or circumstances beyond the Company's reasonable control.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">6. Cancellation Policy</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Cancellation requests must be submitted via telephone, electronic mail, or an approved reservation platform and shall not become effective unless and until acknowledged by Westminster Chariots.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">Unless otherwise specified in a separate written agreement:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>Sedan and SUV reservations canceled more than twenty-four (24) hours prior to the scheduled pickup time shall not incur a cancellation fee.</li>
                  <li>Sedan and SUV reservations canceled within twenty-four (24) hours of the scheduled pickup time shall be subject to the full fare.</li>
                  <li>Sprinter vans, minibuses, motor coaches, and specialty vehicles canceled within seventy-two (72) hours of the scheduled pickup time may be assessed the full fare.</li>
                  <li>Hourly reservations, roadshows, special events, and multi-day engagements may be governed by separate cancellation provisions communicated at the time of booking.</li>
                  <li>No-shows shall be charged the full reservation amount.</li>
                  <li>Reservations abandoned after chauffeur arrival or expiration of the applicable waiting period may be deemed no-shows at the Company's discretion.</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Westminster Chariots reserves the right to determine cancellation charges based upon vehicle type, service category, affiliate obligations, contractual commitments, and operational considerations.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Any approved refund shall be issued to the original method of payment and may be subject to reasonable administrative processing periods.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Except where expressly required by law, Westminster Chariots shall have no obligation to issue refunds, reimbursements, credits, or compensation for canceled reservations, no-shows, abandoned trips, delayed arrivals, missed flights, missed appointments, itinerary changes, or any other circumstance whatsoever.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">7. Wait Time</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Airport arrivals shall include a complimentary grace period in accordance with Westminster Chariots' published service policies.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Additional waiting time may be assessed and billed in increments determined exclusively by the Company.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  For non-airport pickups, any grace period shall be provided solely at the Company's discretion.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Upon expiration of the applicable grace period, waiting time charges may commence automatically and without further notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">8. Flight Monitoring</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Where flight information is provided by the Client, Westminster Chariots may undertake commercially reasonable efforts to monitor commercial airline arrivals.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Flight monitoring is provided solely as a courtesy and shall not constitute a contractual obligation, guarantee, warranty, or representation.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  The Client remains solely responsible for communicating material itinerary changes, delays, cancellations, diversions, or other travel disruptions.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Westminster Chariots shall bear no responsibility or liability arising from inaccurate, incomplete, delayed, or omitted flight information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">9. Passenger Conduct</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Passengers shall conduct themselves in a lawful, respectful, safe, and professional manner at all times.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">The following conduct is strictly prohibited:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>Illegal activity</li>
                  <li>Harassment</li>
                  <li>Physical aggression</li>
                  <li>Threatening behavior</li>
                  <li>Smoking or vaping without authorization</li>
                  <li>Possession of unlawful substances</li>
                  <li>Conduct endangering the chauffeur, vehicle, or public</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Westminster Chariots reserves the unrestricted right to immediately suspend or terminate service, without refund or compensation, whenever passenger conduct presents a safety risk or otherwise interferes with operations.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  The Company further reserves the right to contact, cooperate with, and provide assistance to local, state, federal, or international law enforcement authorities whenever Westminster Chariots reasonably believes that unlawful conduct, fraud, threats, property damage, theft, assault, harassment, or other misconduct has occurred.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  The Company may disclose reservation records, photographs, recordings, communications, payment information, and other relevant evidence to governmental authorities as permitted or required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">10. Vehicle Damage</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Clients shall be fully liable for any damage, destruction, contamination, excessive wear, or loss caused by themselves or their guests.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">Recoverable costs may include, without limitation:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>Repair expenses</li>
                  <li>Cleaning expenses</li>
                  <li>Administrative costs</li>
                  <li>Vehicle downtime</li>
                  <li>Lost revenue</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  The Company reserves the right to charge the payment method on file for all documented damages and associated costs.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Westminster Chariots further reserves all rights to pursue civil remedies, criminal complaints, restitution, injunctive relief, and any other remedies available under applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">11. Lost Property</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Passengers are solely responsible for safeguarding their personal belongings.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Westminster Chariots expressly disclaims all responsibility and liability for lost, stolen, misplaced, abandoned, damaged, or unrecovered property.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Recovered items may, at the Company's discretion, be returned at the Client's sole expense.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  The Company makes no representation or guarantee regarding the recovery, preservation, storage, or return of lost property and shall have no obligation to reimburse any Passenger for any resulting loss.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">12. Confidentiality and Discretion</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Discretion, professionalism, and confidentiality are fundamental principles of Westminster Chariots' service philosophy.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  To the fullest extent permitted by law, information relating to clients, passengers, travel itineraries, destinations, conversations, business activities, and personal affairs shall be treated as confidential.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">Westminster Chariots shall not knowingly disclose confidential information except:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>With client authorization;</li>
                  <li>As required by law;</li>
                  <li>To facilitate transportation services;</li>
                  <li>To protect legal rights or safety interests;</li>
                  <li>To cooperate with governmental or law enforcement authorities.</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  While Westminster Chariots endeavors to maintain strict confidentiality, no representation or warranty is made that all information will remain confidential under every circumstance.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed italic">
                  As a matter of professional practice: what is said in the vehicle stays in the vehicle.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">13. Delays, Schedules, and Compensation</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Westminster Chariots shall use commercially reasonable efforts to provide punctual, reliable, and professional transportation services. Nevertheless, transportation services are inherently subject to variables beyond the Company's control.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">The Company shall not be liable for delays arising from, including but not limited to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>Traffic congestion</li>
                  <li>Road closures</li>
                  <li>Construction</li>
                  <li>Weather conditions</li>
                  <li>Airline delays or cancellations</li>
                  <li>Airport operations</li>
                  <li>Security checkpoints</li>
                  <li>Customs or immigration processing</li>
                  <li>Vehicle accidents involving third parties</li>
                  <li>Government actions</li>
                  <li>Public events</li>
                  <li>Force majeure events</li>
                  <li>Circumstances beyond the Company's reasonable control</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  All pickup times, arrival estimates, and scheduling projections are approximate and provided solely as a courtesy.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Under no circumstances shall Westminster Chariots be obligated to provide refunds, credits, discounts, reimbursements, compensation, liquidated damages, consequential damages, or any other remedy arising from delays, missed flights, missed appointments, missed meetings, missed connections, lost opportunities, lost profits, or schedule disruptions.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  The Client expressly acknowledges and agrees that Westminster Chariots shall have no duty to indemnify, compensate, reimburse, or otherwise make whole any Passenger or Client for losses of any nature arising from transportation delays or disruptions.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Clients are strongly encouraged to schedule transportation with ample time allowances for unforeseen circumstances.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">14. Limitation of Liability</h2>
                <div className="glass rounded-lg p-6 border-l-4 border-primary mb-4">
                  <p className="text-sm font-semibold text-foreground mb-3">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WESTMINSTER CHARIOTS SHALL NOT BE LIABLE FOR:</p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground font-body ml-4">
                    <li>Traffic conditions</li>
                    <li>Road closures</li>
                    <li>Weather conditions</li>
                    <li>Airline delays or cancellations</li>
                    <li>Security incidents</li>
                    <li>Government actions</li>
                    <li>Third-party acts</li>
                    <li>Telecommunications failures</li>
                    <li>Events beyond reasonable control</li>
                    <li>Incidents occurring before pickup or after drop-off</li>
                    <li>Injuries or accidents occurring outside the vehicle</li>
                    <li>Conditions or hazards at airports, hotels, residences, offices, venues, sidewalks, parking areas, or other third-party locations</li>
                    <li>Actions or omissions of third parties not under the Company's control</li>
                  </ul>
                </div>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  The Company's obligations are strictly limited to transportation services rendered within a Company vehicle and under the direct supervision of its chauffeur.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4 font-semibold">
                  UNDER NO CIRCUMSTANCES SHALL WESTMINSTER CHARIOTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, EXEMPLARY, ENHANCED, PUNITIVE, OR MULTIPLIED DAMAGES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOST BUSINESS OPPORTUNITIES, BUSINESS INTERRUPTION, REPUTATIONAL HARM, EMOTIONAL DISTRESS, MISSED FLIGHTS, MISSED APPOINTMENTS, OR MISSED COMMERCIAL ENGAGEMENTS.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  The Company shall have no obligation to reimburse any Client or Passenger for substitute transportation, lodging, meals, business losses, incidental expenses, or other expenditures arising from the use of, inability to use, interruption of, delay of, or cancellation of services.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed font-semibold">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, THE AGGREGATE LIABILITY OF WESTMINSTER CHARIOTS ARISING OUT OF OR RELATING TO ANY CLAIM SHALL NOT EXCEED THE TOTAL AMOUNT ACTUALLY PAID FOR THE SPECIFIC RESERVATION GIVING RISE TO SUCH CLAIM.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">15. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4 font-semibold">
                  ALL SERVICES ARE PROVIDED ON AN "AS IS," "AS AVAILABLE," AND "WITH ALL FAULTS" BASIS.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  WESTMINSTER CHARIOTS EXPRESSLY DISCLAIMS ALL WARRANTIES, REPRESENTATIONS, CONDITIONS, AND GUARANTEES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, PERFORMANCE, AVAILABILITY, OR UNINTERRUPTED SERVICE.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  No oral statement, written communication, course of dealing, or course of performance shall create any warranty not expressly set forth herein.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">16. Indemnification</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  The Client agrees to defend, indemnify, release, and hold harmless Westminster Chariots and its officers, directors, managers, members, employees, chauffeurs, contractors, affiliates, successors, assigns, and representatives from and against any and all claims, demands, actions, liabilities, losses, damages, judgments, settlements, penalties, fines, costs, and expenses, including reasonable attorneys' fees, arising out of or relating to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>Violation of these Terms;</li>
                  <li>Passenger misconduct;</li>
                  <li>Property damage caused by the Client or passengers;</li>
                  <li>Illegal acts;</li>
                  <li>Third-party claims arising from the Client's use of services;</li>
                  <li>Incidents occurring outside the vehicle or after transportation services have concluded.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">17. Force Majeure</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Westminster Chariots shall not be liable for any delay, interruption, suspension, cancellation, deficiency, or failure in performance resulting from causes beyond its reasonable control, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>Severe weather</li>
                  <li>Natural disasters</li>
                  <li>Public health emergencies</li>
                  <li>Labor disputes</li>
                  <li>Government actions</li>
                  <li>Civil unrest</li>
                  <li>Terrorism</li>
                  <li>Utility failures</li>
                  <li>Transportation disruptions</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  The Company's obligations shall be suspended for the duration of any such force majeure event.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Westminster Chariots shall have no obligation to provide refunds, reimbursements, credits, compensation, or substitute services arising from a force majeure occurrence.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">18. Termination of Service</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">
                  Westminster Chariots reserves the absolute right to suspend, refuse, discontinue, or terminate services immediately and without prior notice where:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>Payment cannot be collected;</li>
                  <li>Passenger conduct creates a safety concern;</li>
                  <li>Fraud is suspected;</li>
                  <li>Applicable laws or regulations require termination;</li>
                  <li>Circumstances otherwise warrant termination in the Company's sole and reasonable judgment.</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Where appropriate, Westminster Chariots may contact and cooperate with law enforcement authorities regarding unlawful conduct, threats, fraud, theft, assault, harassment, vandalism, property damage, or other safety-related matters.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Termination of service pursuant to this section shall not create any obligation on the part of Westminster Chariots to provide refunds, reimbursements, credits, offsets, or compensation of any kind.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">19. Governing Law</h2>
                <p className="text-muted-foreground font-body leading-relaxed">
                  These Terms shall be governed by, construed, interpreted, and enforced in accordance with the laws of the Commonwealth of Virginia, without regard to any conflict-of-law principles that would require the application of another jurisdiction's laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">20. Dispute Resolution</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  Prior to commencing litigation, the parties agree to engage in good-faith negotiations in an effort to resolve any dispute, controversy, or claim arising out of or relating to these Terms or the services provided.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  In the event such efforts prove unsuccessful, the parties irrevocably consent to the exclusive jurisdiction and venue of the state and federal courts located within the Commonwealth of Virginia and waive any objection based upon forum non conveniens or similar doctrines.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">21. Entire Agreement</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  These Terms constitute the entire agreement between Westminster Chariots and the Client concerning the subject matter herein and supersede all prior or contemporaneous negotiations, discussions, understandings, representations, warranties, communications, and agreements, whether oral or written.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  If any provision of these Terms is determined to be invalid, unlawful, or unenforceable, the remaining provisions shall remain in full force and effect to the maximum extent permitted by law.
                </p>
              </section>

              <div className="glass rounded-xl p-8 mt-12 border-l-4 border-primary bg-gradient-to-r from-primary/5 to-transparent">
                <h3 className="text-xl font-display font-bold text-foreground mb-4">Westminster Chariots</h3>
                <p className="text-base font-semibold text-foreground mb-2 italic">Travel in Luxury. Arrive in Style.</p>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  Professional Chauffeured Transportation Throughout Virginia, Washington D.C., Maryland, and Beyond.
                </p>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">
                    These terms are designed to ensure a safe, professional, and premium experience for all parties. By using Westminster Chariots services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions of Service.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}
